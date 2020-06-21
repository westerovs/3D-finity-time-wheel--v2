const render = (container, template, place = `beforeend`) => {
  if (container instanceof Element) {
    container.insertAdjacentHTML(place, template);
  }
}

function getCenterArr(array) {
  let a = Math.floor(array.length / 2);
  let b = ((array.length % 2) ? a : a--) + 1;
  array.slice(a, b);

  return a, b;
}

function moveCenterElement(element) {

  element.forEach((item, index) => {
    // найти центральный элемент
    if (index === centerElement) {
      item.style.color = 'red';
    }

    // if (index > centerElement) {
    //   // item.style.opacity = `${opacityUp}`;
    //   // opacityUp -= 0.2;
    //   item.style.color = 'black';
    // }
    // if (index < centerElement) {
    //   // item.style.opacity = `${opacityDown}`;
    //   // opacityDown -= 0.2;
    //   item.style.color = 'blue';
    // }
  })
}

const createTimeSessionTemplate = count => `
      <div class="search__drum-side">
          <span class="side__span side__span--1">${count}</span>
          <span class="side__span side__span--2">:</span>
          <span class="side__span side__span--3">${count}</span>
      </div>`;


function getTimeSessionArr(drum) {
  let countTime = 1;
  for (let i = 1; i <= 190; i++) {
    render(drum, createTimeSessionTemplate(countTime));
    countTime++
  }
}

// ----------------------- барабан времени -------------------------------
let drumContainer = document.querySelector('.search__drum-container');
let drumSide = null;

let drumSideArr = null;
let centerElement = null;

let startDegSide = 35;
let rotateY = 3;
let rotateX = 30;
let inititalRotateX = 30;
let startProgress = 0;
let startRotate = 0;

let progress = 0;
let visuallyItem = 9;

let opacityUp = 1;
let opacityDown = 1;

const step = 360 / visuallyItem - 25; //шаг между эл 15  // 9-кол-во видимых
const visuallyZone = step * visuallyItem;


function init() {
  getTimeSessionArr(drumContainer);

  drumSide = document.querySelectorAll('.search__drum-side');
  drumSideArr = Array.from(drumSide);
  centerElement = getCenterArr(drumSideArr) - 1;

  drumTurnDeg();

  drumSide.forEach((item, index) => {
    item.addEventListener('touchstart', touchStart);
    item.addEventListener('touchmove', touchMove);
  });
}
init()


function drumTurnDeg() {
  drumContainer.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;

  let startDegSideX = startDegSide;

  drumSide.forEach((item, index) => {
    item.style.transform = `rotateX(${startDegSideX}deg) translateZ(100px)`;
    startDegSideX -= 15;

    if (index >= 9) {
      item.classList.add('visually-hidden');
    }
    if (drumSide.length < 9) {
      inititalRotateX = -35 + Math.trunc(drumSide.length / 2) * 15
      rotateX = inititalRotateX
      drumContainer.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
    }
  });
}




// --------------------------------- touchStart
let startTouchPoint = {};
let nowPoint;
let startDate;

function touchStart(event) {
  event.preventDefault();
  event.stopPropagation();

  startTouchPoint.x = event.changedTouches[0].pageX;
  startTouchPoint.y = event.changedTouches[0].pageY;

  startDate = new Date();

  startProgress = progress;
  startRotate = rotateX;
}


// --------------------------------- touchMove
function touchMove(event) {
  event.preventDefault();
  event.stopPropagation();

  let otk = {};
  nowPoint = event.changedTouches[0];
  otk.y = nowPoint.pageY - startTouchPoint.y;

  let otkRotate = otk.y * -1;

  // шаг поворота
  progress = otkRotate + startProgress;
  rotateX = otkRotate + startRotate;
  // console.log(progress, visuallyItem, drumSide.length / 2, step)

  // ----------------------------------------------------------------------------
  // ------------ проверка на элементов < 9
  if (drumSide.length <= 9 && progress > Math.trunc( /* visuallyItem / 2 +  */ drumSide.length / 2) * step) {
    progress = Math.trunc( /* visuallyItem / 2 +  */ drumSide.length / 2) * step
    rotateX = Math.trunc( /* visuallyItem / 2 +  */ drumSide.length / 2) * step + inititalRotateX
  }

  if (drumSide.length <= 9 && progress < -Math.trunc( /* visuallyItem / 2 + */ drumSide.length / 2) * step) {
    progress = -Math.trunc( /* visuallyItem / 2 + */ drumSide.length / 2) * step
    rotateX = -Math.trunc( /* visuallyItem / 2 + */ drumSide.length / 2) * step + inititalRotateX
  }

  drumContainer.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;


  // ----------------------------------------------------------------------------
  // ------------ обычный поворот если > 9
  if (drumSide.length > 9) {

    moveCenterElement(drumSide);

    // // 2 if если прогресс больше кол-ва элемнтов * шаг
    // добавляем первые элементы после последних
    // прогресс >   (предпоследний 28   -    9 )       *  15 = 285
    if (progress > (drumSide.length - 1 - visuallyItem) * step) {

      // как только появится последний элемент - добавляем новый индекс 
      let nexIndex = Math.trunc(
        (progress - (drumSide.length - 1 - visuallyItem) * step) / step
      ) - 1;

      // ----------------------------------------------------------------------------
      // когда элемент пойдёт на второй круг - 
      // добавляем класс repeated (1 if) и он станет видимым
      drumSide.forEach((item, index) => {
        if (index <= nexIndex) {
          // drumSide[index].classList.add('repeated');

          // позиционированние что бы не было дырки
          item.style.transform = `rotateX(${-((drumSide.length - 1) * step + (index * step + step) - startDegSide)}deg) translateZ(100px)`;

        } else {
          // drumSide[index].classList.remove('repeated');
          item.style.transform = `rotateX(${-(index * step) + startDegSide}deg) translateZ(100px)`;
        }
      });

      // ----------------------------------------------------------------------------
      // исправление наложения на втором круге // при обнулении показываем первые эл-ты
      if (
        progress >
        ((drumSide.length - 1) - visuallyItem + visuallyItem + 1) * step // 435
      ) {

        const repeated = document.querySelectorAll('.repeated');
        repeated.forEach((item) => item.classList.remove('repeated'));

        drumSide.forEach((item, index) => {
          item.style.transform = `rotateX(${(-(index * step) + startDegSide)}deg) translateZ(100px)`;

          if (index < visuallyItem) {
            item.classList.remove('visually-hidden');
          }
        });

        // rotateX вычитать текущее положение - 400...
        startRotate = otk.y + 30;
        startProgress = otk.y;

        otk.y = 0;
        progress = 0;
        rotateX = 30;
        drumContainer.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;


        // progress = (drumSide.length - 1 - visuallyItem + 1) * step;
        // drumContainer.style.transform = ` rotateY(3deg) rotateX(${30 + progress}deg)`;
        // startProgress = progress + otk.y;
        // startRotate = 30 + startProgress;
        console.log('обнуление');
      }
    }
    console.log('progress' + progress);
    console.log('startProgress' + startProgress);

    // ----------------------------------------------------------------------------
    // меньше нуля
    if (progress < 0) {

      let nexIndex = Math.abs(Math.trunc((progress / step)))
      let indexFromEnd = drumSide.length - nexIndex;

      drumSide.forEach((item, index) => {
        // if (index >= indexFromEnd) {
        //   drumSide[index].classList.add('repeated');
        //   drumSide[index].style.transform = `rotateX(${35 + (step * (drumSide.length - 1 - index)) + step}deg) translateZ(100px)`; // сделать так, чтобы элементы вставлялись перед первым
        // } 
        // else {
        //   drumSide[index].classList.remove('repeated');
        //   item.style.transform = `rotateX(${-(index * step) + startDegSide}deg) translateZ(100px)`;
        // }
      })

      if (Math.abs(progress) > 9 * step) {
        document.querySelectorAll('.repeated').forEach((item, index) => {
          item.classList.remove('repeated')
        });

        drumSide.forEach((item, index) => {
          item.style.transform = `rotateX(${-(index * step) + startDegSide}deg) translateZ(100px)`;

          if (index * step > (drumSide.length - 1 - (visuallyItem + 1)) * step) {
            item.classList.remove('visually-hidden')
          }
        });

        progress = (drumSide.length - 1 - visuallyItem + 1) * step;
        drumContainer.style.transform = ` rotateY(3deg) rotateX(${30 + progress}deg)`;

        startProgress = progress + otk.y;
        startRotate = 30 + startProgress;
      }
    }

    // ----------------------------------------------------------------------------
    // 1 if показывает текущие элементы и удаляет
    drumSide.forEach((item, index) => {
      if (
        index * step >= progress &&
        index * step < progress + visuallyZone ||
        item.classList.contains('repeated')
      ) {
        item.classList.remove('visually-hidden');
      } else {
        item.classList.add('visually-hidden');
      }
    })


  }
}