var dom_1 = require('../util/dom');
var util_1 = require('../util/util');
var doc = document;
/**
  Animation Steps/Process
  -----------------------

 - Construct animation (doesn't start)
 - Client play()'s animation, returns promise
 - Add before classes to elements
 - Remove before classes from elements
 - Elements staged in "from" effect w/ inline styles
 - Call onReady()
 - Wait for RENDER_DELAY milliseconds (give browser time to render)
 - Call onPlay()
 - Run from/to animation on elements
 - Animations finish async
 - Set inline styles w/ the "to" effects on elements
 - Add after classes to elements
 - Remove after classes from elements
 - Call onFinish()
 - Resolve play()'s promise
**/
/**
 * @private
**/
var Animation = (function () {
    function Animation(ele, opts) {
        if (opts === void 0) { opts = {}; }
        this.reset();
        this._opts = util_1.assign({
            renderDelay: 16
        }, opts);
        this.elements(ele);
        if (!doc.documentElement.animate) {
            void 0;
        }
    }
    Animation.prototype.reset = function () {
        this._el = [];
        this._chld = [];
        this._ani = [];
        this._bfSty = {};
        this._bfAdd = [];
        this._bfRmv = [];
        this._afAdd = [];
        this._afRmv = [];
        this._readys = [];
        this._plays = [];
        this._finishes = [];
    };
    Animation.prototype.elements = function (ele) {
        if (ele) {
            if (typeof ele === 'string') {
                // string query selector
                ele = doc.querySelectorAll(ele);
            }
            if (ele.length) {
                // array of elements
                for (var i = 0; i < ele.length; i++) {
                    this.addElement(ele[i]);
                }
            }
            else {
                // single element
                this.addElement(ele);
            }
        }
        return this;
    };
    Animation.prototype.addElement = function (ele) {
        // ensure only HTML Element nodes
        if (ele) {
            if (ele.nativeElement) {
                // angular ElementRef
                ele = ele.nativeElement;
            }
            if (ele.nodeType === 1) {
                this._el.push(ele);
            }
        }
    };
    Animation.prototype.parent = function (parentAnimation) {
        this._parent = parentAnimation;
        return this;
    };
    Animation.prototype.add = function (childAnimations) {
        var _childAnimations = Array.isArray(childAnimations) ? childAnimations : arguments;
        for (var i = 0; i < _childAnimations.length; i++) {
            _childAnimations[i].parent(this);
            this._chld.push(_childAnimations[i]);
        }
        return this;
    };
    Animation.prototype.duration = function (value) {
        if (arguments.length) {
            this._duration = value;
            return this;
        }
        return this._duration || (this._parent && this._parent.duration()) || 0;
    };
    Animation.prototype.clearDuration = function () {
        this._duration = null;
        for (var i = 0, l = this._chld.length; i < l; i++) {
            this._chld[i].clearDuration();
        }
    };
    Animation.prototype.easing = function (name, opts) {
        if (arguments.length) {
            this._easing = {
                name: name,
                opts: opts
            };
            return this;
        }
        return this._easing || (this._parent && this._parent.easing());
    };
    Animation.prototype.playbackRate = function (value) {
        if (arguments.length) {
            this._rate = value;
            var i;
            for (i = 0; i < this._chld.length; i++) {
                this._chld[i].playbackRate(value);
            }
            for (i = 0; i < this._ani.length; i++) {
                this._ani[i].playbackRate(value);
            }
            return this;
        }
        return (typeof this._rate !== 'undefined' ? this._rate : this._parent && this._parent.playbackRate());
    };
    Animation.prototype.reverse = function () {
        return this.playbackRate(-1);
    };
    Animation.prototype.forward = function () {
        return this.playbackRate(1);
    };
    Animation.prototype.from = function (property, value) {
        if (!this._from) {
            this._from = {};
        }
        this._from[property] = value;
        return this;
    };
    Animation.prototype.to = function (property, value) {
        if (!this._to) {
            this._to = {};
        }
        this._to[property] = value;
        return this;
    };
    Animation.prototype.fromTo = function (property, from, to) {
        return this.from(property, from).to(property, to);
    };
    Animation.prototype.fadeIn = function () {
        return this.fromTo('opacity', 0.001, 1);
    };
    Animation.prototype.fadeOut = function () {
        return this.fromTo('opacity', 0.999, 0);
    };
    Object.defineProperty(Animation.prototype, "before", {
        get: function () {
            var _this = this;
            return {
                addClass: function (className) {
                    _this._bfAdd.push(className);
                    return _this;
                },
                removeClass: function (className) {
                    _this._bfRmv.push(className);
                    return _this;
                },
                setStyles: function (styles) {
                    _this._bfSty = styles;
                    return _this;
                }
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Animation.prototype, "after", {
        get: function () {
            var _this = this;
            return {
                addClass: function (className) {
                    _this._afAdd.push(className);
                    return _this;
                },
                removeClass: function (className) {
                    _this._afRmv.push(className);
                    return _this;
                }
            };
        },
        enumerable: true,
        configurable: true
    });
    Animation.prototype.play = function (done) {
        var self = this;
        // the actual play() method which may or may not start async
        function beginPlay(beginPlayDone) {
            var tasks = [];
            self._chld.forEach(function (childAnimation) {
                tasks.push(function (taskDone) {
                    childAnimation.play(taskDone);
                });
            });
            self._ani.forEach(function (animation) {
                tasks.push(function (taskDone) {
                    animation.play(taskDone);
                });
            });
            parallel(tasks, beginPlayDone);
        }
        if (!self._parent) {
            // this is the top level animation and is in full control
            // of when the async play() should actually kick off
            // stage all animations and child animations at their starting point
            self.stage();
            var promise;
            if (!done) {
                promise = new Promise(function (res) { done = res; });
            }
            function kickoff() {
                // synchronously call all onPlay()'s before play()
                self._onPlay();
                beginPlay(function () {
                    self._onFinish();
                    done();
                });
            }
            if (self._duration > 16 && self._opts.renderDelay > 0) {
                // begin each animation when everything is rendered in their starting point
                // give the browser some time to render everything in place before starting
                dom_1.rafFrames(self._opts.renderDelay / 16, kickoff);
            }
            else {
                // no need to render everything in there place before animating in
                // just kick it off immediately to render them in their "to" locations
                kickoff();
            }
            return promise;
        }
        // this is a child animation, it is told exactly when to
        // start by the top level animation
        beginPlay(done);
    };
    Animation.prototype.stage = function () {
        // before the RENDER_DELAY
        // before the animations have started
        if (!this._isStaged) {
            this._isStaged = true;
            var i, p, l, j, ele, animation;
            for (i = 0, l = this._chld.length; i < l; i++) {
                this._chld[i].stage();
            }
            for (i = 0; i < this._el.length; i++) {
                ele = this._el[i];
                for (j = 0; j < this._bfAdd.length; j++) {
                    ele.classList.add(this._bfAdd[j]);
                }
                for (p in this._bfSty) {
                    ele.style[p] = this._bfSty[p];
                }
                for (j = 0; j < this._bfRmv.length; j++) {
                    ele.classList.remove(this._bfRmv[j]);
                }
            }
            if (this._to) {
                // only animate the elements if there are defined "to" effects
                for (i = 0; i < this._el.length; i++) {
                    animation = new Animate(this._el[i], this._from, this._to, this.duration(), this.easing(), this.playbackRate());
                    if (animation.shouldAnimate) {
                        this._ani.push(animation);
                    }
                }
            }
            for (i = 0; i < this._readys.length; i++) {
                this._readys[i](this);
            }
        }
    };
    Animation.prototype._onPlay = function () {
        // after the RENDER_DELAY
        // before the animations have started
        var i;
        this._isFinished = false;
        for (i = 0; i < this._chld.length; i++) {
            this._chld[i]._onPlay();
        }
        for (i = 0; i < this._plays.length; i++) {
            this._plays[i](this);
        }
    };
    Animation.prototype._onFinish = function () {
        // after the animations have finished
        if (!this._isFinished && !this.isProgress) {
            this._isFinished = true;
            var i, j, ele;
            for (i = 0; i < this._chld.length; i++) {
                this._chld[i]._onFinish();
            }
            if (this.playbackRate() < 0) {
                // reverse direction
                for (i = 0; i < this._el.length; i++) {
                    ele = this._el[i];
                    for (j = 0; j < this._bfAdd.length; j++) {
                        ele.classList.remove(this._bfAdd[j]);
                    }
                    for (j = 0; j < this._bfRmv.length; j++) {
                        ele.classList.add(this._bfRmv[j]);
                    }
                }
            }
            else {
                // normal direction
                for (i = 0; i < this._el.length; i++) {
                    ele = this._el[i];
                    for (j = 0; j < this._afAdd.length; j++) {
                        ele.classList.add(this._afAdd[j]);
                    }
                    for (j = 0; j < this._afRmv.length; j++) {
                        ele.classList.remove(this._afRmv[j]);
                    }
                }
            }
            for (i = 0; i < this._finishes.length; i++) {
                this._finishes[i](this);
            }
        }
    };
    Animation.prototype.pause = function () {
        var i;
        for (i = 0; i < this._chld.length; i++) {
            this._chld[i].pause();
        }
        for (i = 0; i < this._ani.length; i++) {
            this._ani[i].pause();
        }
    };
    Animation.prototype.progressStart = function () {
        this.isProgress = true;
        for (var i = 0; i < this._chld.length; i++) {
            this._chld[i].progressStart();
        }
        this.duration(1000);
        this.play();
        this.pause();
    };
    Animation.prototype.progress = function (value) {
        value = Math.min(1, Math.max(0, value));
        this.isProgress = true;
        var i;
        for (i = 0; i < this._chld.length; i++) {
            this._chld[i].progress(value);
        }
        for (i = 0; i < this._ani.length; i++) {
            this._ani[i].progress(value);
        }
    };
    /**
     * Get the current time of the first animation
     * in the list. To get a specific time of an animation, call
     * subAnimationInstance.getCurrentTime()
     */
    Animation.prototype.getCurrentTime = function () {
        if (this._chld.length > 0) {
            return this._chld[0].getCurrentTime();
        }
        if (this._ani.length > 0) {
            return this._ani[0].getCurrentTime();
        }
        return 0;
    };
    Animation.prototype.progressEnd = function (shouldComplete, rate) {
        if (rate === void 0) { rate = 3; }
        var promises = [];
        this.isProgress = false;
        for (var i = 0; i < this._chld.length; i++) {
            promises.push(this._chld[i].progressEnd(shouldComplete));
        }
        this._ani.forEach(function (animation) {
            if (shouldComplete) {
                animation.playbackRate(rate);
            }
            else {
                animation.playbackRate(rate * -1);
            }
            promises.push(new Promise(function (resolve) {
                animation.play(resolve);
            }));
        });
        return Promise.all(promises);
    };
    Animation.prototype.onReady = function (fn, clear) {
        if (clear) {
            this._readys = [];
        }
        this._readys.push(fn);
        return this;
    };
    Animation.prototype.onPlay = function (fn, clear) {
        if (clear) {
            this._plays = [];
        }
        this._plays.push(fn);
        return this;
    };
    Animation.prototype.onFinish = function (fn, clear) {
        if (clear) {
            this._finishes = [];
        }
        this._finishes.push(fn);
        return this;
    };
    Animation.prototype.clone = function () {
        function copy(dest, src) {
            // undo what stage() may have already done
            util_1.assign(dest, src);
            dest._isFinished = dest._isStaged = dest.isProgress = false;
            dest._chld = [];
            dest._ani = [];
            for (var i = 0; i < src._chld.length; i++) {
                dest.add(copy(new Animation(), src._chld[i]));
            }
            return dest;
        }
        return copy(new Animation(), this);
    };
    Animation.prototype.dispose = function (removeElement) {
        var i;
        for (i = 0; i < this._chld.length; i++) {
            this._chld[i].dispose(removeElement);
        }
        for (i = 0; i < this._ani.length; i++) {
            this._ani[i].dispose();
        }
        if (removeElement) {
            for (i = 0; i < this._el.length; i++) {
                this._el[i].parentNode && this._el[i].parentNode.removeChild(this._el[i]);
            }
        }
        this.reset();
    };
    /*
     STATIC CLASSES
     */
    Animation.create = function (name) {
        var AnimationClass = AnimationRegistry[name];
        if (!AnimationClass) {
            // couldn't find an animation by the given name
            // fallback to just the base Animation class
            AnimationClass = Animation;
        }
        return new AnimationClass();
    };
    Animation.createTransition = function (enteringView, leavingView, opts) {
        if (opts === void 0) { opts = {}; }
        var TransitionClass = AnimationRegistry[opts.animation];
        if (!TransitionClass) {
            // didn't find a transition animation, default to ios-transition
            TransitionClass = AnimationRegistry['ios-transition'];
        }
        return new TransitionClass(enteringView, leavingView, opts);
    };
    Animation.register = function (name, AnimationClass) {
        AnimationRegistry[name] = AnimationClass;
    };
    return Animation;
})();
exports.Animation = Animation;
/**
 * @private
**/
var Animate = (function () {
    function Animate(ele, fromEffect, toEffect, duration, easingConfig, playbackRate) {
        // https://w3c.github.io/web-animations/
        // not using the direct API methods because they're still in flux
        // however, element.animate() seems locked in and uses the latest
        // and correct API methods under the hood, so really doesn't matter
        if (!fromEffect) {
            void 0;
            return;
        }
        this.toEffect = parseEffect(toEffect);
        this.shouldAnimate = (duration > 32);
        if (!this.shouldAnimate) {
            inlineStyle(ele, this.toEffect);
            return;
        }
        this.ele = ele;
        // stage where the element will start from
        this.fromEffect = parseEffect(fromEffect);
        inlineStyle(ele, this.fromEffect);
        this.duration = duration;
        this.rate = (typeof playbackRate !== 'undefined' ? playbackRate : 1);
        this.easing = easingConfig && easingConfig.name || 'linear';
        this.effects = [convertProperties(this.fromEffect)];
        if (this.easing in EASING_FN) {
            insertEffects(this.effects, this.fromEffect, this.toEffect, easingConfig);
        }
        else if (this.easing in CUBIC_BEZIERS) {
            this.easing = 'cubic-bezier(' + CUBIC_BEZIERS[this.easing] + ')';
        }
        this.effects.push(convertProperties(this.toEffect));
    }
    Animate.prototype.play = function (done) {
        var self = this;
        if (self.ani) {
            self.ani.play();
        }
        else {
            // https://developers.google.com/web/updates/2014/05/Web-Animations---element-animate-is-now-in-Chrome-36
            // https://w3c.github.io/web-animations/
            // Future versions will use "new window.Animation" rather than "element.animate()"
            self.ani = self.ele.animate(self.effects, {
                duration: self.duration || 0,
                easing: self.easing,
                playbackRate: self.rate // old way of setting playbackRate, but still necessary
            });
            self.ani.playbackRate = self.rate;
        }
        self.ani.onfinish = function () {
            // lock in where the element will stop at
            // if the playbackRate is negative then it needs to return
            // to its "from" effects
            if (self.ani) {
                inlineStyle(self.ele, self.rate < 0 ? self.fromEffect : self.toEffect);
                self.ani = self.ani.onfinish = null;
                done && done();
            }
        };
    };
    Animate.prototype.pause = function () {
        this.ani && this.ani.pause();
    };
    Animate.prototype.progress = function (value) {
        if (this.ani) {
            // passed a number between 0 and 1
            if (this.ani.playState !== 'paused') {
                this.ani.pause();
            }
            // don't let the progress finish the animation
            // leave it off JUST before it's finished
            value = Math.min(0.999, Math.max(0.001, value));
            this.ani.currentTime = (this.duration * value);
        }
    };
    Animate.prototype.getCurrentTime = function () {
        return (this.ani && this.ani.currentTime) || 0;
    };
    Animate.prototype.playbackRate = function (value) {
        this.rate = value;
        if (this.ani) {
            this.ani.playbackRate = value;
        }
    };
    Animate.prototype.dispose = function () {
        this.ele = this.ani = this.effects = this.toEffect = null;
    };
    return Animate;
})();
function insertEffects(effects, fromEffect, toEffect, easingConfig) {
    easingConfig.opts = easingConfig.opts || {};
    var increment = easingConfig.opts.increment || 0.04;
    var easingFn = EASING_FN[easingConfig.name];
    var pos, tweenEffect, addEffect, property, toProperty, fromValue, diffValue;
    for (pos = increment; pos <= (1 - increment); pos += increment) {
        tweenEffect = {};
        addEffect = false;
        for (property in toEffect) {
            toProperty = toEffect[property];
            if (toProperty.tween) {
                fromValue = fromEffect[property].num;
                diffValue = toProperty.num - fromValue;
                tweenEffect[property] = {
                    value: roundValue((easingFn(pos, easingConfig.opts) * diffValue) + fromValue) + toProperty.unit
                };
                addEffect = true;
            }
        }
        if (addEffect) {
            effects.push(convertProperties(tweenEffect));
        }
    }
}
function parseEffect(inputEffect) {
    var val, r, num, property;
    var outputEffect = {};
    for (property in inputEffect) {
        val = inputEffect[property];
        r = val.toString().match(/(^-?\d*\.?\d*)(.*)/);
        num = parseFloat(r[1]);
        outputEffect[property] = {
            value: val,
            num: num,
            unit: (r[0] != r[2] ? r[2] : ''),
            tween: !isNaN(num) && (ANIMATE_PROPERTIES.indexOf(property) > -1)
        };
    }
    return outputEffect;
}
function convertProperties(inputEffect) {
    var outputEffect = {};
    var transforms = [];
    var value, property;
    for (property in inputEffect) {
        value = inputEffect[property].value;
        if (TRANSFORMS.indexOf(property) > -1) {
            transforms.push(property + '(' + value + ')');
        }
        else {
            outputEffect[property] = value;
        }
    }
    if (transforms.length) {
        transforms.push('translateZ(0px)');
        outputEffect.transform = transforms.join(' ');
    }
    return outputEffect;
}
function inlineStyle(ele, effect) {
    if (ele && effect) {
        var transforms = [];
        var value, property;
        for (property in effect) {
            value = effect[property].value;
            if (TRANSFORMS.indexOf(property) > -1) {
                transforms.push(property + '(' + value + ')');
            }
            else {
                ele.style[property] = value;
            }
        }
        if (transforms.length) {
            transforms.push('translateZ(0px)');
            ele.style[dom_1.CSS.transform] = transforms.join(' ');
        }
    }
}
function roundValue(val) {
    return Math.round(val * 10000) / 10000;
}
var TRANSFORMS = ['translateX', 'translateY', 'translateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ',
    'rotate', 'rotateX', 'rotateY', 'rotateZ', 'skewX', 'skewY', 'perspective'];
var ANIMATE_PROPERTIES = TRANSFORMS.concat('opacity');
// Robert Penner's Easing Functions
// http://robertpenner.com/easing/
var CUBIC_BEZIERS = {
    // default browser suppored easing
    // ease
    // ease-in
    // ease-out
    // ease-in-out
    // Cubic
    'ease-in-cubic': '0.55,0.055,0.675,0.19',
    'ease-out-cubic': '0.215,0.61,0.355,1',
    'ease-in-Out-cubic': '0.645,0.045,0.355,1',
    // Circ
    'ease-in-circ': '0.6,0.04,0.98,0.335',
    'ease-out-circ': '0.075,0.82,0.165,1',
    'ease-in-out-circ': '0.785,0.135,0.15,0.86',
    // Expo
    'ease-in-expo': '0.95,0.05,0.795,0.035',
    'ease-out-expo': '0.19,1,0.22,1',
    'ease-in-out-expo': '1,0,0,1',
    // Quad
    'ease-in-quad': '0.55,0.085,0.68,0.53',
    'ease-out-quad': '0.25,0.46,0.45,0.94',
    'ease-in-out-quad': '0.455,0.03,0.515,0.955',
    // Quart
    'ease-in-quart': '0.895,0.03,0.685,0.22',
    'ease-out-quart': '0.165,0.84,0.44,1',
    'ease-in-out-quart': '0.77,0,0.175,1',
    // Quint
    'ease-in-quint': '0.755,0.05,0.855,0.06',
    'ease-out-quint': '0.23,1,0.32,1',
    'ease-in-out-quint': '0.86,0,0.07,1',
    // Sine
    'ease-in-sine': '0.47,0,0.745,0.715',
    'ease-out-sine': '0.39,0.575,0.565,1',
    'ease-in-out-sine': '0.445,0.05,0.55,0.95',
    // Back
    'ease-in-back': '0.6,-0.28,0.735,0.045',
    'ease-out-back': '0.175,0.885,0.32,1.275',
    'ease-in-out-back': '0.68,-0.55,0.265,1.55',
};
var EASING_FN = {
    'elastic': function (pos) {
        return -1 * Math.pow(4, -8 * pos) * Math.sin((pos * 6 - 1) * (2 * Math.PI) / 2) + 1;
    },
    'swing-from-to': function (pos, opts) {
        var s = opts.s || 1.70158;
        return ((pos /= 0.5) < 1) ? 0.5 * (pos * pos * (((s *= (1.525)) + 1) * pos - s)) :
            0.5 * ((pos -= 2) * pos * (((s *= (1.525)) + 1) * pos + s) + 2);
    },
    'swing-from': function (pos, opts) {
        var s = opts.s || 1.70158;
        return pos * pos * ((s + 1) * pos - s);
    },
    'swing-to': function (pos, opts) {
        var s = opts.s || 1.70158;
        return (pos -= 1) * pos * ((s + 1) * pos + s) + 1;
    },
    'bounce': function (pos) {
        if (pos < (1 / 2.75)) {
            return (7.5625 * pos * pos);
        }
        else if (pos < (2 / 2.75)) {
            return (7.5625 * (pos -= (1.5 / 2.75)) * pos + 0.75);
        }
        else if (pos < (2.5 / 2.75)) {
            return (7.5625 * (pos -= (2.25 / 2.75)) * pos + 0.9375);
        }
        return (7.5625 * (pos -= (2.625 / 2.75)) * pos + 0.984375);
    },
    'bounce-past': function (pos) {
        if (pos < (1 / 2.75)) {
            return (7.5625 * pos * pos);
        }
        else if (pos < (2 / 2.75)) {
            return 2 - (7.5625 * (pos -= (1.5 / 2.75)) * pos + 0.75);
        }
        else if (pos < (2.5 / 2.75)) {
            return 2 - (7.5625 * (pos -= (2.25 / 2.75)) * pos + 0.9375);
        }
        return 2 - (7.5625 * (pos -= (2.625 / 2.75)) * pos + 0.984375);
    },
    'ease-out-bounce': function (pos) {
        if ((pos) < (1 / 2.75)) {
            return (7.5625 * pos * pos);
        }
        else if (pos < (2 / 2.75)) {
            return (7.5625 * (pos -= (1.5 / 2.75)) * pos + 0.75);
        }
        else if (pos < (2.5 / 2.75)) {
            return (7.5625 * (pos -= (2.25 / 2.75)) * pos + 0.9375);
        }
        return (7.5625 * (pos -= (2.625 / 2.75)) * pos + 0.984375);
    },
    'ease-from-to': function (pos) {
        if ((pos /= 0.5) < 1)
            return 0.5 * Math.pow(pos, 4);
        return -0.5 * ((pos -= 2) * Math.pow(pos, 3) - 2);
    },
    'ease-from': function (pos, opts) {
        return Math.pow(pos, opts.s || 4);
    },
    'ease-to': function (pos, opts) {
        return Math.pow(pos, opts.s || 0.25);
    },
    /*
     * scripty2, Thomas Fuchs (MIT Licence)
     * https://raw.github.com/madrobby/scripty2/master/src/effects/transitions/transitions.js
     */
    'spring': function (pos, opts) {
        var damping = opts.damping || 4.5;
        var elasticity = opts.elasticity || 6;
        return 1 - (Math.cos(pos * damping * Math.PI) * Math.exp(-pos * elasticity));
    },
    'sinusoidal': function (pos) {
        return (-Math.cos(pos * Math.PI) / 2) + 0.5;
    }
};
var AnimationRegistry = {};
function parallel(tasks, done) {
    var l = tasks.length;
    if (!l) {
        done && done();
        return;
    }
    var completed = 0;
    function taskCompleted() {
        completed++;
        if (completed === l) {
            done && done();
        }
    }
    for (var i = 0; i < l; i++) {
        tasks[i](taskCompleted);
    }
}
