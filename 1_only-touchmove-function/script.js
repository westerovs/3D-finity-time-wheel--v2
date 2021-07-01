'use strict'
const drumContainer = document.querySelector('.search__drum-container')

const INIT_ROTATE = 50
let rotateX = INIT_ROTATE
let startRotate  = 0
let startTouches = 0

const drumRotate = (rotate) => {
    drumContainer.style.transform = `rotateX(${ rotate }deg)`
}

const touchStart = (event) => {
    startTouches = event.changedTouches[0]
    startRotate = rotateX
}

const touchMove = (event) => {
    const moveTouches = event.changedTouches[0]
    const differenceStartMove = startTouches.pageY - moveTouches.pageY
    
    rotateX = startRotate + differenceStartMove
    drumContainer.style.transform = `rotateX(${ rotateX }deg)`
}

const resetRotate = () => {
    drumRotate(INIT_ROTATE)
}

const init = () => {
    drumContainer.addEventListener('touchstart', touchStart)
    drumContainer.addEventListener('touchmove', touchMove)
    
    drumRotate(rotateX)
}

init()
