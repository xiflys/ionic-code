Ionic.loadComponents(17,["ion-gesture","Gesture",[["onTouchStart","touchstart",0,1,0],["onMouseDown","mousedown",0,1,0],["onTouchMove","touchmove",0,1,0],["onMoveMove","document:mousemove",0,1,0],["onTouchEnd","touchend",0,1,0],["onMouseUp","document:mouseup",0,1,0]],[],0,0,0,function(t,e,i){"use strict";function s(t){if(t){var e=t.changedTouches;if(e&&e.length>0)return e[0].clientX;if(void 0!==t.pageX)return t.pageX}return 0}function r(t){if(t){var e=t.changedTouches;if(e&&e.length>0)return e[0].clientY;if(void 0!==t.pageY)return t.pageY}return 0}function o(t,e){if("child"===e)return t.firstElementChild;if("parent"===e){if(t.parentElement)return t.parentElement;if(t.parentNode&&t.parentNode.host)return t.parentNode.host}return"body"===e?t.ownerDocument.body:"document"===e?t.ownerDocument:"window"===e?t.ownerDocument.defaultView:t}function n(t,e){for(var i=Object.keys(e),s=0;s<i.length;s++)t.style[i[s]]=e[i[s]]}function l(t){return t.timeStamp||Date.now()}var a=function(){function t(){this.id=0,this.requestedStart={},this.disabledGestures={},this.disabledScroll=new Set,this.capturedID=null}return t.prototype.createGesture=function(t,e,i){return new h(this,++this.id,t,e,i)},t.prototype.start=function(t,e,i){return this.canStart(t)?(this.requestedStart[e]=i,!0):(delete this.requestedStart[e],!1)},t.prototype.capture=function(t,e,i){if(!this.start(t,e,i))return!1;var s=this.requestedStart,r=-1e4;for(var o in s)r=Math.max(r,s[o]);return r===i?(this.capturedID=e,this.requestedStart={},!0):(delete s[e],!1)},t.prototype.release=function(t){delete this.requestedStart[t],this.capturedID&&t===this.capturedID&&(this.capturedID=null)},t.prototype.disableGesture=function(t,e){var i=this.disabledGestures[t];i||(i=new Set,this.disabledGestures[t]=i),i.add(e)},t.prototype.enableGesture=function(t,e){var i=this.disabledGestures[t];i&&i.delete(e)},t.prototype.disableScroll=function(t){this.disabledScroll.add(t)},t.prototype.enableScroll=function(t){this.disabledScroll.delete(t)},t.prototype.canStart=function(t){return!this.capturedID&&!this.isDisabled(t)},t.prototype.isCaptured=function(){return!!this.capturedID},t.prototype.isScrollDisabled=function(){return this.disabledScroll.size>0},t.prototype.isDisabled=function(t){var e=this.disabledGestures[t];return!!(e&&e.size>0)},t}(),h=function(){function t(t,e,i,s,r){this.ctrl=t,this.id=e,this.name=i,this.priority=s,this.disableScroll=r}return t.prototype.canStart=function(){return!!this.ctrl&&this.ctrl.canStart(this.name)},t.prototype.start=function(){return!!this.ctrl&&this.ctrl.start(this.name,this.id,this.priority)},t.prototype.capture=function(){if(!this.ctrl)return!1;var t=this.ctrl.capture(this.name,this.id,this.priority);return t&&this.disableScroll&&this.ctrl.disableScroll(this.id),t},t.prototype.release=function(){this.ctrl&&(this.ctrl.release(this.id),this.disableScroll&&this.ctrl.enableScroll(this.id))},t.prototype.destroy=function(){this.release(),this.ctrl=null},t}(),u=function(){function t(t,e,i){this.direction=t,this.dirty=!1,this.angle=0,this.isPan=0;var s=i*(Math.PI/180);this.maxCosine=Math.cos(s),this.threshold=e*e}return t.prototype.start=function(t,e){this.startX=t,this.startY=e,this.angle=0,this.isPan=0,this.dirty=!0},t.prototype.detect=function(t,e){if(!this.dirty)return!1;var i=t-this.startX,s=e-this.startY;if(i*i+s*s>=this.threshold){var r=Math.atan2(s,i),o="y"===this.direction?Math.sin(r):Math.cos(r);return this.angle=r,o>this.maxCosine?this.isPan=1:o<-this.maxCosine?this.isPan=-1:this.isPan=0,this.dirty=!1,!0}return!1},t.prototype.isGesture=function(){return this.isPan},t}(),c=function(){function t(){this.detail={},this.positions=[],this.lastTouch=0,this.hasCapturedPan=!1,this.hasPress=!1,this.hasStartedPan=!1,this.requiresMove=!1,this.isMoveQueued=!1,this.direction="x",this.gestureName="",this.gesturePriority=0,this.listenOn="child",this.maxAngle=40,this.threshold=20,this.type="pan"}return t.prototype.ionViewDidLoad=function(){var t=this;i.controllers.gesture=i.controllers.gesture||new a,this.gesture=i.controllers.gesture.createGesture(this.gestureName,this.gesturePriority,!1);var e=this.type.replace(/\s/g,"").toLowerCase().split(",");e.indexOf("pan")>-1&&(this.pan=new u(this.direction,this.threshold,this.maxAngle),this.requiresMove=!0),this.hasPress=e.indexOf("press")>-1,(this.pan||this.hasPress)&&(i.listener.enable(this,"touchstart",!0,this.listenOn),i.listener.enable(this,"mousedown",!0,this.listenOn),i.dom.write(function(){n(o(t.$el,t.listenOn),d)}))},t.prototype.onTouchStart=function(t){this.lastTouch=l(t),this.enableMouse(!1),this.enableTouch(!0),this.pointerDown(t,this.lastTouch)},t.prototype.onMouseDown=function(t){var e=l(t);(0===this.lastTouch||this.lastTouch+p<e)&&(this.enableMouse(!0),this.enableTouch(!1),this.pointerDown(t,e))},t.prototype.pointerDown=function(t,e){if(!this.gesture||this.hasStartedPan)return!1;var i=this.detail;return i.startX=i.currentX=s(t),i.startY=i.currentY=r(t),i.startTimeStamp=i.timeStamp=e,i.velocityX=i.velocityY=i.deltaX=i.deltaY=0,i.directionX=i.directionY=i.velocityDirectionX=i.velocityDirectionY=null,i.event=t,this.positions.length=0,(!this.canStart||!1!==this.canStart(i))&&(this.positions.push(i.currentX,i.currentY,e),this.gesture.release(),!!this.gesture.start()&&(this.pan&&(this.hasStartedPan=!0,this.hasCapturedPan=!1,this.pan.start(i.startX,i.startY)),!0))},t.prototype.onTouchMove=function(t){this.lastTouch=this.detail.timeStamp=l(t),this.pointerMove(t)},t.prototype.onMoveMove=function(t){var e=l(t);(0===this.lastTouch||this.lastTouch+p<e)&&(this.detail.timeStamp=e,this.pointerMove(t))},t.prototype.pointerMove=function(t){var e=this,s=this.detail;this.calcGestureData(t),this.pan&&(this.hasCapturedPan?this.isMoveQueued||(this.isMoveQueued=!0,i.dom.write(function(){e.isMoveQueued=!1,s.type="pan",e.onMove?e.onMove(s):i.emit(e,"ionGestureMove",{detail:e.detail})})):this.pan.detect(s.currentX,s.currentY)&&0!==this.pan.isGesture()&&(this.tryToCapturePan(t)||this.abortGesture()))},t.prototype.calcGestureData=function(t){var e=this.detail;e.currentX=s(t),e.currentY=r(t),e.deltaX=e.currentX-e.startX,e.deltaY=e.currentY-e.startY,e.event=t,e.directionX=e.velocityDirectionX=e.deltaX>0?"left":e.deltaX<0?"right":null,e.directionY=e.velocityDirectionY=e.deltaY>0?"up":e.deltaY<0?"down":null;var i=this.positions;i.push(e.currentX,e.currentY,e.timeStamp);for(var o=i.length-1,n=o,l=e.timeStamp-100,a=o;a>0&&i[a]>l;a-=3)n=a;if(n!==o){var h=i[n-2]-i[o-2],u=i[n-1]-i[o-1],c=16.67/(i[o]-i[n]);e.velocityX=h*c,e.velocityY=u*c,e.velocityDirectionX=h>0?"left":h<0?"right":null,e.velocityDirectionY=u>0?"up":u<0?"down":null}},t.prototype.tryToCapturePan=function(t){return!(this.gesture&&!this.gesture.capture())&&(this.detail.event=t,this.onStart?this.onStart(this.detail):i.emit(this,"ionGestureStart",{detail:this.detail}),this.hasCapturedPan=!0,!0)},t.prototype.abortGesture=function(){this.hasStartedPan=!1,this.hasCapturedPan=!1,this.gesture.release(),this.enable(!1),this.notCaptured(this.detail)},t.prototype.onTouchEnd=function(t){this.lastTouch=this.detail.timeStamp=l(t),this.pointerUp(t),this.enableTouch(!1)},t.prototype.onMouseUp=function(t){var e=l(t);(0===this.lastTouch||this.lastTouch+p<e)&&(this.detail.timeStamp=e,this.pointerUp(t),this.enableMouse(!1))},t.prototype.pointerUp=function(t){var e=this.detail;this.gesture&&this.gesture.release(),e.event=t,this.calcGestureData(t),this.pan?this.hasCapturedPan?(e.type="pan",this.onEnd?this.onEnd(e):i.emit(this,"ionGestureEnd",{detail:e})):this.hasPress?this.detectPress():this.notCaptured?this.notCaptured(e):i.emit(this,"ionGestureNotCaptured",{detail:e}):this.hasPress&&this.detectPress(),this.hasCapturedPan=!1,this.hasStartedPan=!1},t.prototype.detectPress=function(){var t=this.detail;Math.abs(t.startX-t.currentX)<10&&Math.abs(t.startY-t.currentY)<10&&(t.type="press",this.onPress?this.onPress(t):i.emit(this,"ionPress",{detail:t}))},t.prototype.enableMouse=function(t){this.requiresMove&&i.listener.enable(this,"document:mousemove",t),i.listener.enable(this,"document:mouseup",t)},t.prototype.enableTouch=function(t){this.requiresMove&&i.listener.enable(this,"touchmove",t),i.listener.enable(this,"touchend",t)},t.prototype.enable=function(t){this.enableMouse(t),this.enableTouch(t)},t.prototype.ionViewWillUnload=function(){this.gesture&&this.gesture.destroy(),this.gesture=this.pan=this.detail=this.detail.event=null},t}(),d={"touch-action":"none","user-select":"none","-webkit-user-drag":"none","-webkit-tap-highlight-color":"rgba(0,0,0,0)"},p=2500;t.Gesture=c}],["ion-scroll","Scroll",[["onNativeScroll","scroll",0,1,1],["onTouchStart","touchstart",0,1,0],["onTouchMove","touchmove",0,1,0],["onTouchEnd","touchend",0,1,0]],[],0,0,0,function(t,e,i){"use strict";var s=function(){function t(){this.id=0,this.requestedStart={},this.disabledGestures={},this.disabledScroll=new Set,this.capturedID=null}return t.prototype.createGesture=function(t,e,i){return new r(this,++this.id,t,e,i)},t.prototype.start=function(t,e,i){return this.canStart(t)?(this.requestedStart[e]=i,!0):(delete this.requestedStart[e],!1)},t.prototype.capture=function(t,e,i){if(!this.start(t,e,i))return!1;var s=this.requestedStart,r=-1e4;for(var o in s)r=Math.max(r,s[o]);return r===i?(this.capturedID=e,this.requestedStart={},!0):(delete s[e],!1)},t.prototype.release=function(t){delete this.requestedStart[t],this.capturedID&&t===this.capturedID&&(this.capturedID=null)},t.prototype.disableGesture=function(t,e){var i=this.disabledGestures[t];i||(i=new Set,this.disabledGestures[t]=i),i.add(e)},t.prototype.enableGesture=function(t,e){var i=this.disabledGestures[t];i&&i.delete(e)},t.prototype.disableScroll=function(t){this.disabledScroll.add(t)},t.prototype.enableScroll=function(t){this.disabledScroll.delete(t)},t.prototype.canStart=function(t){return!this.capturedID&&!this.isDisabled(t)},t.prototype.isCaptured=function(){return!!this.capturedID},t.prototype.isScrollDisabled=function(){return this.disabledScroll.size>0},t.prototype.isDisabled=function(t){var e=this.disabledGestures[t];return!!(e&&e.size>0)},t}(),r=function(){function t(t,e,i,s,r){this.ctrl=t,this.id=e,this.name=i,this.priority=s,this.disableScroll=r}return t.prototype.canStart=function(){return!!this.ctrl&&this.ctrl.canStart(this.name)},t.prototype.start=function(){return!!this.ctrl&&this.ctrl.start(this.name,this.id,this.priority)},t.prototype.capture=function(){if(!this.ctrl)return!1;var t=this.ctrl.capture(this.name,this.id,this.priority);return t&&this.disableScroll&&this.ctrl.disableScroll(this.id),t},t.prototype.release=function(){this.ctrl&&(this.ctrl.release(this.id),this.disableScroll&&this.ctrl.enableScroll(this.id))},t.prototype.destroy=function(){this.release(),this.ctrl=null},t}(),o=function(){function t(){this.positions=[],this.queued=!1,this.isScrolling=!1,this.detail={},this.enabled=!0,this.jsScroll=!1}return t.prototype.ionViewDidLoad=function(){i.controllers.gesture=i.controllers.gesture||new s,this.gesture=i.controllers.gesture.createGesture("scroll",100,!1)},t.prototype.onNativeScroll=function(){var t=this;!t.queued&&t.enabled&&(t.queued=!0,i.dom.read(function(e){t.queued=!1,t.onScroll(e||Date.now())}))},t.prototype.onScroll=function(t){var e=this,s=e.detail,r=e.positions;if(s.timeStamp=t,s.scrollTop=e.getTop(),s.scrollLeft=e.getLeft(),e.isScrolling||(e.isScrolling=!0,s.startY=s.scrollTop,s.startX=s.scrollLeft,s.velocityY=s.velocityX=s.deltaY=s.deltaX=r.length=0,e.ionScrollStart?e.ionScrollStart(s):i.emit(this,"ionScrollStart",{detail:s})),s.directionX=s.velocityDirectionX=s.deltaX>0?"left":s.deltaX<0?"right":null,s.directionY=s.velocityDirectionY=s.deltaY>0?"up":s.deltaY<0?"down":null,r.push(s.scrollTop,s.scrollLeft,s.timeStamp),r.length>3){s.deltaY=s.scrollTop-s.startY,s.deltaX=s.scrollLeft-s.startX;for(var o=r.length-1,n=o,l=s.timeStamp-100,a=o;a>0&&r[a]>l;a-=3)n=a;if(n!==o){var h=r[n-2]-r[o-2],u=r[n-1]-r[o-1],c=16.67/(r[o]-r[n]);s.velocityY=h*c,s.velocityX=u*c,s.velocityDirectionX=u>0?"left":u<0?"right":null,s.velocityDirectionY=h>0?"up":h<0?"down":null}}clearTimeout(e.tmr),e.tmr=setTimeout(function(){e.isScrolling=!1,i.dom.read(function(t){e.isScrolling||e.onEnd(t)})},80),e.ionScrollStart?e.ionScroll(s):i.emit(this,"ionScroll",{detail:s})},t.prototype.onEnd=function(t){var e=this,s=e.detail;s.timeStamp=t||Date.now(),e.ionScrollEnd?e.ionScrollEnd(s):i.emit(this,"ionScrollEnd",{detail:s})},t.prototype.enableJsScroll=function(t,e){this.jsScroll=!0,i.listener.enable(this,"scroll",!1),i.listener.enable(this,"touchstart",!0)},t.prototype.onTouchStart=function(){if(this.enabled)throw i.listener.enable(this,"touchmove",!0),i.listener.enable(this,"touchend",!0),"jsScroll: TODO!"},t.prototype.onTouchMove=function(){this.enabled},t.prototype.onTouchEnd=function(){i.listener.enable(this,"touchmove",!1),i.listener.enable(this,"touchend",!1),this.enabled},t.prototype.getTop=function(){return this.jsScroll?this._t:this._t=this.$el.scrollTop},t.prototype.getLeft=function(){return this.jsScroll?0:this._l=this.$el.scrollLeft},t.prototype.setTop=function(t){this._t=t,this.jsScroll?this.$el.style.transform=this.$el.style.webkitTransform="translate3d("+-1*this._l+"px,"+-1*t+"px,0px)":this.$el.scrollTop=t},t.prototype.setLeft=function(t){this._l=t,this.jsScroll?this.$el.style.transform=this.$el.style.webkitTransform="translate3d("+-1*t+"px,"+-1*this._t+"px,0px)":this.$el.scrollLeft=t},t.prototype.scrollTo=function(t,e,s,r){function o(n){if(p++,!l.$el||f||p>d)return l.isScrolling=!1,a.style.transform=a.style.webkitTransform="",void r();var y=Math.min(1,(n-h)/s),S=--y*y*y+1;u!==e&&l.setTop(S*(e-u)+u),c!==t&&l.setLeft(Math.floor(S*(t-c)+c)),S<1?i.dom.raf(o):(f=!0,l.isScrolling=!1,a.style.transform=a.style.webkitTransform="",r())}var n;void 0===r&&(n=new Promise(function(t){r=t}));var l=this,a=l.$el;if(!a)return r(),n;if(s<32)return l.setTop(e),l.setLeft(t),r(),n;var h,u=a.scrollTop,c=a.scrollLeft,d=s/16+100,p=0,f=!1;return l.isScrolling=!0,i.dom.write(function(){i.dom.write(function(t){h=t,o(t)})}),n},t.prototype.scrollToTop=function(t){return this.scrollTo(0,0,t)},t.prototype.scrollToBottom=function(t){var e=0;return this.$el&&(e=this.$el.scrollHeight-this.$el.clientHeight),this.scrollTo(0,e,t)},t.prototype.ionViewWillUnload=function(){this.gesture&&this.gesture.destroy(),this.gesture=this.detail=this.detail.event=null},t}();t.Scroll=o}]);