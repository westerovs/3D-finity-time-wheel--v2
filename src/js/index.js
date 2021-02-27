function animate(item) {
    const start = performance.now()

    requestAnimationFrame(function animateX(time) {
        // время анимации от 0 до 1
        let animationTime = (time - start) / item.durationAnim
        if (animationTime > 1) animationTime = 1

        // текущее состояние анимации
        const progress = item.typeAnim(animationTime)

        item.draw(progress) // отрисовка

        // условие запуска
        if (animationTime < 1) {
            requestAnimationFrame(animateX)
        }
    })
}

const render = (container, template, place = 'beforeend') => {
    if (container instanceof Element) {
        container.insertAdjacentHTML(place, template)
    }
}

class DrumTime {
    constructor() {
        this.drumContainer = document.querySelector('.search__drum-container')
        this.drumSide = null

        this.startDegSide = 35
        this.rotateY = 3
        this.rotateX = 30

        this.initRotateX = 30
        this.startProgress = 0
        this.startRotate = 0
        this.progress = 0
        this.visuallyItem = 9

        this.step = 360 / this.visuallyItem - 25
        this.visuallyZone = this.step * this.visuallyItem // 135
        this.vZone = this.step * this.visuallyItem // 135

        this.startTouchPoint = {}
        this.nowPoint = null

        this.init = async () => {
            // this.timesList = null;
            this.getTimeSessionArr(this.drumContainer)
            this.drumSide = document.querySelectorAll('.search__drum-side')
            this.drumTurnDeg()

            this.visuallyAndHiddenElements()

            this.drumSide.forEach(item => {
                item.addEventListener('touchstart', this.touchStart)
                item.addEventListener('touchmove', this.touchMove)
            })
        }
    }

    // 1 моковые данные
    createTimeSessionTemplate = time => `
        <div class="search__drum-side">
            <span class="search__side-item search__side-item--places">
                <span class="search__side-places-num">${ time }</span> 
                <span class="search__side-places-text">мест</span>
            </span>
            <div class="search__side-time">
                <span class="search__side-time-item search__side-time-item--hour">${ time }</span>
                <span class="search__side-time-item search__side-time-item--separator">:</span>
                <span class="search__side-time-item search__side-time-item--minute">00</span>
            </div>
            <span class="search__side-item search__side-item--hall">luxx</span>
        </div>`;

    // 2 моковые данные
    getTimeSessionArr(place) {
        this.countTime = 1

        for (let i = 1; i <= 36; i++) {
            render(place, this.createTimeSessionTemplate(this.countTime))
            this.countTime++
        }
    }

    drumTurnDeg = () => {
        this.rotateX = this.initRotateX
        this.progress = 0
        this.startProgress = 0
        this.drumContainer.style.transform = `rotateY(${ this.rotateY }deg) rotateX(${ this.rotateX }deg)`

        this.startDegSideX = this.startDegSide

        this.drumSide.forEach((item, index) => {
            item.style.transform = `rotateX(${ this.startDegSideX }deg) translateZ(100px)`
            this.startDegSideX -= 15

            if (index >= 9) {
                item.classList.add('visually-hidden')
            }

            if (this.drumSide.length < 9) {
                this.initRotateX = -35 + Math.trunc(this.drumSide.length / 2) * 15
                this.rotateX = this.initRotateX
                this.drumContainer.style.transform = `rotateY(${ this.rotateY }deg) rotateX(${ this.rotateX }deg)`
            }
        })
    }

    // --------------------------------- touchStart
    touchStart = event => {
        event.preventDefault()
        event.stopPropagation()

        this.startTouchPoint.x = event.changedTouches[0].pageX
        this.startTouchPoint.y = event.changedTouches[0].pageY

        this.startProgress = this.progress
        this.startRotate = this.rotateX
    }

    // --------------------------------- touchMove
    touchMove = event => {
        event.preventDefault()
        event.stopPropagation()

        this.objTouchPoint = {}
        this.nowPoint = event.changedTouches[0]
        this.objTouchPoint.y = this.nowPoint.pageY - this.startTouchPoint.y
        this.objTouchPointRotate = this.objTouchPoint.y * -1

        // шаг поворота
        this.progress = this.objTouchPointRotate + this.startProgress
        this.rotateX = this.objTouchPointRotate + this.startRotate

        // ---------------------------------------- стопор элементов < 9
        if (this.drumSide.length <= 9 && this.progress > Math.trunc(this.drumSide.length / 2) * this.step) {
            this.progress = Math.trunc(this.drumSide.length / 2) * (this.step)
            this.rotateX = Math.trunc(this.drumSide.length / 2) * (this.step) + this.initRotateX
        }
        if (this.drumSide.length <= 9 && this.progress < -Math.trunc(this.drumSide.length / 2) * this.step) {
            this.progress = -Math.trunc(this.drumSide.length / 2) * (this.step)
            this.rotateX = -Math.trunc(this.drumSide.length / 2) * (this.step) + this.initRotateX
        }
        this.drumContainer.style.transform = `rotateY(${ this.rotateY }deg) rotateX(${ this.rotateX }deg)`

        // ---------------------------------------- стопор элементов > 9
        if (this.drumSide.length > 9) {
            // вверх
            if (this.progress < Math.trunc(-this.visuallyZone / 2)) {
                this.progress = Math.trunc(-this.visuallyZone / 2)
                this.rotateX = this.progress + this.startDegSide
            }
            // вниз
            if (this.progress > (this.drumSide.length - 1) * this.step - Math.trunc(this.visuallyZone / 2)) {
                this.progress = (this.drumSide.length - 1) * this.step - Math.trunc(this.visuallyZone / 2)
                this.rotateX = this.progress + this.startDegSide
            }
            this.drumContainer.style.transform = `rotateY(${ this.rotateY }deg) rotateX(${ this.rotateX }deg)`
        }

        this.visuallyAndHiddenElements()
    } // end touchMove

    // показывает текущие элементы и cкрывает
    visuallyAndHiddenElements = () => {
        if (this.drumSide.length === 1) this.drumDisableMove()

        if (this.drumSide.length >= 2) {
            this.drumEnableMove()
            this.vZone = this.drumSide.length < 9 ? this.drumSide.length * this.step : this.visuallyItem * this.step

            // console.log(`progress`, this.progress)

            this.drumSide.forEach((drumSideItem, drumSideIndex) => {
                if ((
                    (drumSideIndex * this.step) >= this.progress + (-30 + this.initRotateX)
                        && (drumSideIndex * this.step) < this.progress + this.visuallyZone)) {
                    drumSideItem.classList.remove('visually-hidden')
                    this.centerEl = Math.trunc((this.progress + (this.vZone / 2)) / this.step)
                    // console.warn(`centerEl:`, this.centerEl)

                    if (drumSideIndex < this.centerEl) {
                        drumSideItem.style.opacity = `${ 1 - (this.centerEl - drumSideIndex) / 5 }`
                    }

                    if (drumSideIndex > this.centerEl) {
                        drumSideItem.style.opacity = `${ 1 - (drumSideIndex - this.centerEl) / 5 }`
                    }

                    if (drumSideIndex === this.centerEl) {
                        drumSideItem.style.opacity = `${ 1 }`
                    }
                } else {
                    drumSideItem.classList.add('visually-hidden')
                }
            })
        }
    }

    initVoiceAutoRotateDrum = voice => {
        this.sideTime = Array.from(document.querySelectorAll('.search__side-time'))
        this.isFound = false
        this.arrTime = []
        this.vZone = this.step * this.visuallyItem

        if (this.sideTime.length < 9) {
            this.vZone = this.step * this.sideTime.length // 135
        }
        // вытащить время в строку
        this.sideTime.forEach(side => {
            this.arr = side.textContent.split(':')

            this.trimedArr = this.arr.map(trim => trim.trim())

            this.trimedString = this.trimedArr.join(':')
            this.arrTime.push(this.trimedString)
        })

        this.arrTime.forEach(async (itemTime, indexTime) => {
            if (voice === itemTime && !this.isFound) {
                this.isFound = true
                // console.log(`itemTime: `, itemTime, indexTime);

                this.startRotate = this.rotateX
                // автопрокрутка:  30     -     135 / 2        +  index     * 15    +    15 / 2
                this.rotateX = this.initRotateX - (this.vZone / 2) + (indexTime * this.step) // + (step / 2);

                await this.animationMoveDrum(1700)
            }
        })
        // return [arrTime];
    } // end initVoiceAutoRotateDrum

    animationMoveDrum = time => {
        this.autoRotate = this.rotateX - this.startRotate

        animate({
            // длительность
            durationAnim: time,
            // тип анимации
            typeAnim: animationTime => Math.pow(animationTime, 1),
            // отрисовка
            draw: progressAnimations => {
                this.drumContainer.style.transform = `
                    rotateY(${ this.rotateY }deg)
                    rotateX(${ this.startRotate + progressAnimations * (this.autoRotate) }deg)`

                this.newProgressAnimat = this.startRotate + progressAnimations * (this.autoRotate) - this.initRotateX
                this.progress = this.newProgressAnimat
                this.startProgress = this.progress

                this.visuallyAndHiddenElements()
            },
        })
    }

    removeDrumTime = () => {
        document.querySelectorAll('.search__drum-side').forEach(item => item.remove())
    }

    drumEnableMove = () => {
        document.querySelector('.search__drum').style.pointerEvents = 'auto'
    }

    drumDisableMove = () => {
        document.querySelector('.search__drum').style.pointerEvents = 'none'
    }
} // end class

// ------> initialization
const drum = new DrumTime()
drum.init()
drum.initVoiceAutoRotateDrum('15:00')
