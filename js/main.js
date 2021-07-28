class SwipeHandler {

    constructor() {
        this.target = null;
        this.touchInitialX = 0;
        this.touchInitialY = 0;
        this.touchDiffX = 0;
        this.touchDiffY = 0;
        this.scrollCallbacks = [];
        this.clickCallbacks = [];
        this.delay = 100;
        this.lastUpdate = 0;
        this.baseDiff = 0;
        this.totalDiff = 0;
        this.dragging = false;
    }

    startTouchDrag(event) {
        this.lastUpdate = Date.now();
        this.touchInitialX = event.touches[0].clientX;
        this.touchInitialY = event.touches[0].clientY;
        const compStyle = window.getComputedStyle(this.target);
        const transMatrix = new DOMMatrixReadOnly(compStyle.transform);
        this.baseDiff = transMatrix.m41;
        this.totalDiff = this.baseDiff;
        this.dragging = true;
    }

    startMouseDrag(event) {
        this.lastUpdate = Date.now();
        this.initialX = event.clientX;
        const compStyle = window.getComputedStyle(this.target);
        const transMatrix = new DOMMatrixReadOnly(compStyle.transform);
        this.baseDiff = transMatrix.m41;
        this.totalDiff = this.baseDiff;
        this.dragging = true;
    }

    moveTouchDrag(event) {
        if (this.dragging === true) {
            this.touchDiffX = this.touchInitialX - event.touches[0].clientX;
            this.touchDiffY = this.touchInitialY - event.touches[0].clientY;
            this.totalDiff = this.baseDiff + this.touchDiffX;
        }
    }

    moveMouseDrag(event) {
        if (this.dragging === true) {
            var diffX = event.clientX - this.initialX;
            this.totalDiff = this.baseDiff + diffX;
            if (this.totalDiff < 10 && (-1 * this.totalDiff) < (this.target.offsetWidth * 0.6 + 10)) {
                this.target.style.transform = "translateX(" + this.totalDiff + "px)";
            }
        }
    }

    stopTouchDrag(event) {
        if (this.dragging === true) {
            var scrollPercent = (-1 * this.baseDiff) / this.target.offsetWidth;
            if (scrollPercent > 0.45) {
                scrollPercent = 0.45;
            }
            var currentOrder = Math.trunc((scrollPercent + 0.15) / 0.3);
            if (Math.abs(this.touchDiffX) > Math.abs(this.touchDiffY)) {
                if (this.touchDiffX < 0) {
                    this.scrolledToNext(Math.max(0, currentOrder - 1));
                } else {
                    this.scrolledToNext(Math.min(2, currentOrder + 1));
                }
            }
            this.target.style.transform = null;
            this.dragging = false;
        }
        if ((Date.now() - this.lastUpdate) < this.delay) {
            this.clickEvent();
        }
    }

    stopMouseDrag(event) {
        if (this.dragging === true) {
            var scrollPercent = (-1 * this.totalDiff) / this.target.offsetWidth;
            if (scrollPercent > 0.45) {
                scrollPercent = 0.45;
            }
            var order = Math.trunc((scrollPercent + 0.15) / 0.3);
            this.scrolledToNext(order);
            this.target.style.transform = null;
            this.dragging = false;
        }
        if ((Date.now() - this.lastUpdate) < this.delay) {
            this.clickEvent();
        }
    }

    setTarget(element) {
        this.target = element;
        var self = this;
        element.ontouchstart = function(e) {
            self.startTouchDrag(e);
        }
        element.ontouchmove = function(e) {
            self.moveTouchDrag(e);
        }
        element.ontouchend = function(e) {
            self.stopTouchDrag(e);
        }
        element.ontouchcancel = function(e) {
            self.stopTouchDrag(e);
        }
        element.onmousedown = function(e) {
            self.startMouseDrag(e);
        }
        element.onmousemove = function(e) {
            self.moveMouseDrag(e);
        }
        element.onmouseup = function(e) {
            self.stopMouseDrag(e);
        }
        document.onmouseout = function(e) {
            self.stopMouseDrag(e);
        }
    }

    scrolledToNext(elementOrder) {
        if (this.scrollCallbacks.length > 0) {
            for (i = 0; i < this.scrollCallbacks.length; i++) {
                this.scrollCallbacks[i](elementOrder);
            }
        }
    }

    clickEvent() {
        if (this.clickCallbacks.length > 0) {
            for (i = 0; i < this.clickCallbacks.length; i++) {
                this.clickCallbacks[i]();
            }
        }
    }

}

function clickSlide() {
    var clickedSlide = listDraggable.querySelector(".slide:hover");
    if (clickedSlide !== null) {
        window.location.href = clickedSlide.getAttribute("href");
    }
}

let listDraggable = document.querySelector(".list-draggable");
if (listDraggable.offsetWidth > window.innerWidth) {
    let swiper = new SwipeHandler();

    swiper.setTarget(listDraggable);
    swiper.scrollCallbacks.push(switchActiveProjectSlide);
    swiper.clickCallbacks.push(clickSlide);
} else {
    listDraggable.onclick = clickSlide;
}

function handleListButtonClick(event) {
    var element = event.target;
    var listButtons = element.parentElement.querySelectorAll("li");
    var clickedElementNumber = 0;
    for (i = 0; i < listButtons.length; i++) {
        if (element === listButtons[i]) {
            clickedElementNumber = i;
        }
    }
    switchActiveProjectSlide(clickedElementNumber);
}

function switchActiveProjectSlide(order) {
    var listButtons = document.querySelectorAll(".projects-container .list-buttons>li");
    for (i = 0; i < listButtons.length; i++) {
        listButtons[i].classList.remove("active");
    }
    listButtons[order].classList.add("active");
    var draggableElement = document.querySelector(".projects-container .list-draggable");
    for (i = 1; i <= 3; i++) {
        draggableElement.classList.remove("active-item-" + i);
    }
    draggableElement.classList.add("active-item-" + (order + 1));
}

let listButtons = document.querySelectorAll(".list-buttons>li");

for (i = 0; i < listButtons.length; i++) {
    listButtons[i].onclick = handleListButtonClick;
}

function observerCallback(entries, observer) {
    entries.forEach(element => {
        if (element.isIntersecting) {
            element.target.classList.add("in-view");
            element.target.classList.add("seen");
        } else {
            element.target.classList.remove("in-view");
        }
    });
}

let observerOptions = {
    root: null,
    rootMargin: "0px",
    treshold: 0.1
};

let observer = new IntersectionObserver(observerCallback, observerOptions);

observer.observe(document.querySelector(".intro-container"));
observer.observe(document.querySelector(".list-track"));