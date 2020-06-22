const render = (container, template, place = `beforeend`) => {
  if (container instanceof Element) {
    container.insertAdjacentHTML(place, template);
  }
};

// function getCoordinatOpacityElem(parent, child) {
//   const opacityContainer = document.querySelector(`${parent}`);
//   const opacityElement = document.querySelector(`${child}`);

//   const topParent = opacityContainer.getBoundingClientRect().top;
//   const topElement = opacityElement.getBoundingClientRect().top;

//   let blockOpacity = topElement - topParent;

//   return [blockOpacity, topParent];
// }

function getCenterElemInArr(array) {
  let a = Math.floor(array.length / 2);
  let b = array.length % 2 ? a : a--;
  array.slice(a, b);

  return a, b;
}


const spanPlaces = (places) => `
  <span class="side__span span--place">
    <span class="side__span-place1">${places}</span>
    <span class="side__span-place2">мест</span>
  </span>`;

const spanHall = (hallName) => `
  <span class="side__span span--hall">${hallName}</span>`;

const createTimeSessionTemplate = (count) => `
  <div class="search__drum-side">
      <span class="side__span side__span--1">${count}</span>
      <span class="side__span side__span--2">:</span>
      <span class="side__span side__span--3">${count}</span>
  </div>`;

function getTimeSessionArr(place) {
  let countTime = 1;

  for (let i = 1; i <= 20; i++) {
    render(place, createTimeSessionTemplate(countTime));
    countTime++;
  }
}

// ----------------------- барабан времени -------------------------------
let drumContainer = document.querySelector(".search__drum-container");
let drumSide = null;

const startDegSide = 35;
let rotateY = 3;
let rotateX = 30;

let inititalRotateX = 30;
let startProgress = 0;
let startRotate = 0;
let progress = 0;
let visuallyItem = 9;

const step = 360 / visuallyItem - 25;
const visuallyZone = step * visuallyItem; // 135

let dinamicVisuallyZone = progress + visuallyZone;
let dinamicProgress = progress + (visuallyZone / 2);

// блоки с прозрачностью
// const blockOpacity = getCoordinatOpacityElem(".wrapper", ".opacity-el");
// const elementOpacityTop = blockOpacity[0];
// const wrapperTop = blockOpacity[1];


function init() {

  getTimeSessionArr(drumContainer);

  drumSide = document.querySelectorAll(".search__drum-side");

  drumTurnDeg();

  drumSide.forEach((item, index) => {
    item.addEventListener("touchstart", touchStart);
    item.addEventListener("touchmove", touchMove);
  });
}


function drumTurnDeg() {
  drumContainer.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;

  let startDegSideX = startDegSide;

  drumSide.forEach((item, index) => {
    item.style.transform = `rotateX(${startDegSideX}deg) translateZ(100px)`;
    startDegSideX -= 15;

    if (index >= 9) {
      item.classList.add("visually-hidden");
    }

    if (drumSide.length < 9) {
      inititalRotateX = -35 + Math.trunc(drumSide.length / 2) * 15;
      rotateX = inititalRotateX;
      drumContainer.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
    }

    if (index === 4) {
      render(item, spanHall(`Luxe`))
      render(item, spanPlaces(`10`))
    }
    if (index === 5) {
      render(item, spanHall(`Black`))
      render(item, spanPlaces(`0`))
    }
  });
}

// --------------------------------- touchStart
let startTouchPoint = {};
let nowPoint;

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

  // ------------ проверка на элементов < 9
  if (drumSide.length <= 9 && progress > Math.trunc(drumSide.length / 2) * step) {
    progress = Math.trunc(drumSide.length / 2) * step
    rotateX = Math.trunc(drumSide.length / 2) * step + inititalRotateX
  }

  if (drumSide.length <= 9 && progress < -Math.trunc(drumSide.length / 2) * step) {
    progress = -Math.trunc(drumSide.length / 2) * step
    rotateX = -Math.trunc(drumSide.length / 2) * step + inititalRotateX
  }

  drumContainer.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;

  // ------------ обычный поворот если > 9
  if (drumSide.length > 9) {
    // ---------------------------------------- стопор элементов
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

    // // 2 if если прогресс больше кол-ва элемнтов * шаг
    // добавляем первые элементы после последних
    // прогресс >   (предпоследний 28   -    9 )       *  15 = 285
    if (progress > (--drumSide.length - visuallyItem) * step) {
      // исправление наложения на втором круге // при обнулении показываем первые эл-ты
      if (
        progress >
        (drumSide.length - 1 - visuallyItem + visuallyItem + 1) * step // 435
      ) {
        const repeated = document.querySelectorAll(".repeated");
        repeated.forEach((item) => item.classList.remove("repeated"));

        drumSide.forEach((item, index) => {
          item.style.transform = `rotateX(${
            -(index * step) + startDegSide
            }deg) translateZ(100px)`;

          if (index < visuallyItem) {
            item.classList.remove("visually-hidden");
          }
        });

        // rotateX вычитать текущее положение - 400...
        startRotate = objTouchPoint.y + 30;
        startProgress = objTouchPoint.y;

        objTouchPoint.y = 0;
        progress = 0;
        rotateX = 30;
        drumContainer.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
        console.warn("обнуление");
      }
    }
    // console.log("progress" + progress);
    // console.log("startProgress" + startProgress);


    // меньше нуля
    if (progress < 0) {

      if (Math.abs(progress) > 9 * step) {
        document.querySelectorAll(".repeated").forEach((item, index) => {
          item.classList.remove("repeated");
        });

        drumSide.forEach((item, index) => {
          item.style.transform = `
            rotateX(${-(index * step) + startDegSide}deg) translateZ(100px)`;
          if (
            index * step >
            (drumSide.length - 1 - (visuallyItem + 1)) * step
          ) {
            item.classList.remove("visually-hidden");
          }
        });

        progress = (--drumSide.length - visuallyItem + 1) * step;
        drumContainer.style.transform = `rotateY(3deg) rotateX(${30 + progress}deg)`;

        startProgress = progress + objTouchPoint.y;
        startRotate = 30 + startProgress;
      }
    }

    // 1 if показывает текущие элементы и удаляет
    drumSide.forEach((item, index) => {
      if ((
          index * step >= progress &&
          index * step < progress + visuallyZone) ||
        item.classList.contains("repeated")
      ) {
        // console.log(`progress: ` + progress)
        item.classList.remove("visually-hidden");

      } else {
        item.classList.add("visually-hidden");
      }
    });
    opacityUp()
  }

}

function opacityUp() {
  let test2 = document.querySelectorAll('.search__drum-side:not(.visually-hidden)');
  let arrTest2 = Array.from(test2);

  let centerEl = null;
  let count = 1;

  test2.forEach((item, index) => {
    let centerEl = getCenterElemInArr(arrTest2)
    // console.warn(`центральный индекс: ${centerEl}`);

    if (index === centerEl) {
      item.style.color = 'white';
      item.style.opacity = '1';
    };

    if (index < centerEl) {
      item.style.color = 'red';
      // item.style.opacity = `${(index/centerEl) * 0.7}`;
    }
    if (index > centerEl) {
      item.style.color = 'blue';
      // item.style.opacity = `${((test2.length-1 - index)/centerEl) * 0.7}`;
    }

    /*
      найти прогресс каждого элемента 
      найти центр эл по прогрессу
      динамический прогресс
      динамическая vizualzone
    */


    // let itemProgress = Math.abs(35 - (index * step) + startDegSide);
    // let tragetOpacity = itemProgress / progress;
    // console.log(itemProgress, tragetOpacity);
  })
}


init();





/*
forEach >>> visual - elements >>>

// -----------------------------------------------------------
if (item.classList.contains("visually-hidden") === false) {
  if ((item.getBoundingClientRect().top - wrapperTop) < elementOpacityTop) {
    item.style.color = "red";
  }
  // координаты каждого элемента
  console.log(item.getBoundingClientRect().top - wrapperTop);
}
*/



// 3 прозрачность

// 2 сделать прокрутку до выбранного времени
function choiceTimeDrum() {
  const drumSide = Array.from(document.querySelectorAll('.search__drum-side'));

  drumSide.forEach((item, index) => {
    console.log(item.textContent);
  })
}

choiceTimeDrum()