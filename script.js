function animate(item) {
  let start = performance.now();

  requestAnimationFrame(function animateX(time) {
    // время анимации от 0 до 1
    let animationTime = (time - start) / item.durationAnim;
    if (animationTime > 1) animationTime = 1;

    // текущее состояние анимации
    let progress = item.typeAnim(animationTime);

    item.draw(progress); // отрисовка

    // условие запуска
    if (animationTime < 1) {
      requestAnimationFrame(animateX);
    }
  });
}

const render = (container, template, place = `beforeend`) => {
  if (container instanceof Element) {
    container.insertAdjacentHTML(place, template);
  }
};

let drumContainer = document.querySelector('.search__drum-container');
let drumSide = null;

let startDegSide = 35;
let rotateY = 3;
let rotateX = 30;

let inititalRotateX = 30;
let startProgress = 0;
let startRotate = 0;
let progress = 0;
let visuallyItem = 9;

const step = 360 / visuallyItem - 25;
const visuallyZone = step * visuallyItem; // 135
let vZone = step * visuallyItem; // 135

let startTouchPoint = {};
let nowPoint;

async function initDrumTime() {
  // let timesList = null;


  // ----------------------- барабан времени -------------------------------

  // 1 моковые данные
  const createTimeSessionTemplate = (time) => `
  <div class="search__drum-side">

      <span class="search__side-item search__side-item--places">
          <span class="search__side-places-num">${time}</span> 
          <span class="search__side-places-text">мест</span>
      </span>

      <div class="search__side-time">
          <span class="search__side-time-item search__side-time-item--hour">${time}</span>
          <span class="search__side-time-item search__side-time-item--separator">:</span>
          <span class="search__side-time-item search__side-time-item--minute">00</span>
      </div>

      <span class="search__side-item search__side-item--hall">luxx</span>
  </div>`;

  // 2 моковые данные
  function getTimeSessionArr(place) {
    let countTime = 1;

    for (let i = 1; i <= 30; i++) {
      render(place, createTimeSessionTemplate(countTime));
      countTime++;
    }
  }

  function init() {
    getTimeSessionArr(drumContainer);
    drumSide = document.querySelectorAll('.search__drum-side');
    drumTurnDeg();

    visuallyAndHiddenElements();

    drumSide.forEach(item => {
      item.addEventListener('touchstart', touchStart);
      item.addEventListener('touchmove', touchMove);
    });
  }
  init()

  function drumTurnDeg() {
    rotateX = inititalRotateX;
    progress = 0;
    startProgress = 0;
    drumContainer.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;

    let startDegSideX = startDegSide;

    drumSide.forEach((item, index) => {
      item.style.transform = `rotateX(${startDegSideX}deg) translateZ(100px)`;
      startDegSideX -= 15;

      if (index >= 9) {
        item.classList.add('visually-hidden');
      }

      if (drumSide.length < 9) {
        inititalRotateX = -35 + Math.trunc(drumSide.length / 2) * 15;
        rotateX = inititalRotateX;
        drumContainer.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
      }
    });
  }

  // --------------------------------- touchStart


  function touchStart(event) {
    event.preventDefault();
    event.stopPropagation();

    startTouchPoint.x = event.changedTouches[0].pageX;
    startTouchPoint.y = event.changedTouches[0].pageY;

    startProgress = progress;
    startRotate = rotateX;
  }

  // --------------------------------- touchMove
  function touchMove(event) {
    event.preventDefault();
    event.stopPropagation();

    let objTouchPoint = {};
    nowPoint = event.changedTouches[0];
    objTouchPoint.y = nowPoint.pageY - startTouchPoint.y;

    let objTouchPointRotate = objTouchPoint.y * -1;

    // шаг поворота
    progress = objTouchPointRotate + startProgress;
    rotateX = objTouchPointRotate + startRotate;

    // ---------------------------------------- стопор элементов < 9
    if (drumSide.length <= 9 && progress > Math.trunc(drumSide.length / 2) * step) {
      progress = Math.trunc(drumSide.length / 2) * (step)
      rotateX = Math.trunc(drumSide.length / 2) * (step) + inititalRotateX


    }
    if (drumSide.length <= 9 && progress < -Math.trunc(drumSide.length / 2) * step) {
      progress = -Math.trunc(drumSide.length / 2) * (step)
      rotateX = -Math.trunc(drumSide.length / 2) * (step) + inititalRotateX

    }
    drumContainer.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;

    //   // ---------------------------------------- стопор элементов > 9
    if (drumSide.length > 9) {
      // вверх
      if (progress < Math.trunc(-visuallyZone / 2)) {
        progress = Math.trunc(-visuallyZone / 2)
        rotateX = progress + startDegSide;
      }
      // вниз
      if (progress > (drumSide.length - 1) * step - Math.trunc(visuallyZone / 2)) {
        progress = (drumSide.length - 1) * step - Math.trunc(visuallyZone / 2)
        rotateX = progress + startDegSide;
      }

      drumContainer.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;

      // // 1 if если прогресс больше кол-ва элемнтов * шаг
      //   if (progress > (--drumSide.length - visuallyItem) * step) {

      //     // исправление наложения на втором круге // при обнулении показываем первые эл-ты
      //     if (
      //       progress >
      //       (drumSide.length - 1 - visuallyItem + visuallyItem + 1) * step // 435
      //     ) {
      //       const repeated = document.querySelectorAll(".repeated");
      //       repeated.forEach((item) => item.classList.remove("repeated"));

      //       drumSide.forEach((item, index) => {
      //         item.style.transform = `rotateX(${
      //                       -(index * step) + startDegSide
      //                       }deg) translateZ(100px)`;

      //         if (index < visuallyItem) {
      //           item.classList.remove("visually-hidden");
      //         }
      //       });

      //       // rotateX вычитать текущее положение - 400...
      //       startRotate = objTouchPoint.y + 30;
      //       startProgress = objTouchPoint.y;

      //       objTouchPoint.y = 0;
      //       progress = 0;
      //       rotateX = 30;
      //       drumContainer.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
      //     }
    }

    //   // 2 меньше нуля
    // if (progress < 0) {
    //   if (Math.abs(progress) > 9 * step) {
    //     document.querySelectorAll(".repeated").forEach((item, index) => {
    //       item.classList.remove("repeated");
    //     });

    //     drumSide.forEach((item, index) => {
    //       item.style.transform = `rotateX(${-(index * step) + startDegSide}deg) translateZ(100px)`;
    //       if (index * step > (drumSide.length - 1 - (visuallyItem + 1)) * step) {
    //         item.classList.remove("visually-hidden");
    //       }
    //     });

    //     progress = (drumSide.length - 1 - visuallyItem + 1) * step;
    //     drumContainer.style.transform = `rotateY(3deg) rotateX(${30 + progress}deg)`;

    //     startProgress = progress + objTouchPoint.y;
    //     startRotate = 30 + startProgress;
    //   }
    // }
    // }

    visuallyAndHiddenElements();
  } //end touchmove
  // return timesList;
} // end initDrumTime


// показывает текущие элементы и cкрывает
function visuallyAndHiddenElements() {
  // if (drumSide.length === 1) drumDisableMove();

  if (drumSide.length >= 2) {
    // drumEnableMove();
    vZone = drumSide.length < 9 ? drumSide.length * step : visuallyItem * step;
    console.log(progress)
    drumSide.forEach((drumSideItem, drumSideIndex) => {
      if ((
        (drumSideIndex * step) >= progress + (-30 + inititalRotateX) &&
        (drumSideIndex * step) < progress + visuallyZone) ||
        drumSideItem.classList.contains("repeated")
      ) {
        drumSideItem.classList.remove("visually-hidden");
        const centerEl = Math.trunc((progress + (vZone / 2)) / step)
        // console.warn(`centerEl:`, centerEl)

        if (drumSideIndex < centerEl) {
          drumSideItem.style.opacity = `${1 - (centerEl - drumSideIndex) / 5}`;
        }

        if (drumSideIndex > centerEl) {
          drumSideItem.style.opacity = `${1 - (drumSideIndex - centerEl) / 5}`;
        }

        if (drumSideIndex === centerEl) {
          drumSideItem.style.opacity = `${1}`;
        }
      } else {
        drumSideItem.classList.add("visually-hidden");
      }
    });
  }
}

function initVoiceAutoRotateDrum(voice) {
  const sideTime = Array.from(document.querySelectorAll('.search__side-time'));
  let isFound = false;
  let arrTime = [];
  let vZone = step * visuallyItem;

  if (sideTime.length < 9) {
    vZone = step * sideTime.length; // 135
  }
  // вытащить время в строку
  sideTime.forEach((side) => {
    let arr = side.textContent.split(':');

    let trimedArr = arr.map(trim => {
      return trim.trim();
    });

    let trimedString = trimedArr.join(':');
    arrTime.push(trimedString);
  })

  arrTime.forEach(async (itemTime, indexTime) => {
    if (voice === itemTime && !isFound) {
      isFound = true;
      // console.log(`itemTime: `, itemTime, indexTime);

      startRotate = rotateX;
      // автопрокрутка:  30     -     135 / 2        +  index     * 15    +    15 / 2                 
      rotateX = inititalRotateX - (vZone / 2) + (indexTime * step) // + (step / 2);
      // const autoRotate = rotateX - startRotate;

      await animationMoveDrum(1700);
    }
  })
  // return [arrTime];
} // end initVoiceAutoRotateDrum


function animationMoveDrum(time) {
  const autoRotate = rotateX - startRotate;
  animate({
    // длительность
    durationAnim: time,
    // тип анимации
    typeAnim: (animationTime) => {
      return Math.pow(animationTime, 1);
    },
    // отрисовка
    draw: (progressAnimations) => {
      drumContainer.style.transform = `rotateY(${rotateY}deg) rotateX(${startRotate + progressAnimations * (autoRotate)}deg)`;

      let newProgressAnimat = startRotate + progressAnimations * (autoRotate) - inititalRotateX;
      progress = newProgressAnimat;
      startProgress = progress;

      visuallyAndHiddenElements();
    }
  });
};

// function removeDrumTime() {
//   document.querySelectorAll('.search__drum-side').forEach(item => item.remove());
// }

// function drumEnableMove() {
//   document.querySelector('.search__drum').style.pointerEvents = `auto`;
// }

// function drumDisableMove() {
//   document.querySelector('.search__drum').style.pointerEvents = `none`;
// }

initDrumTime()
initVoiceAutoRotateDrum(`11:00`)