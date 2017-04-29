Ionic.loadComponents("ee116c72",function(t,e,o){var i=function(){function t(){}return t.prototype.changed=function(t){o.emit(this,"ionChange",{detail:{checked:t}})},t.prototype.canStart=function(){return!this.disabled},t.prototype.onDragStart=function(t){this.startX=t.startX,this.fireFocus()},t.prototype.onDragMove=function(t){this.checked?t.currentX+15<this.startX&&(this.checked=!1,this.activated=!0,this.startX=t.currentX):t.currentX-15>this.startX&&(this.checked=!0,this.activated=t.currentX<this.startX+5,this.startX=t.currentX)},t.prototype.onDragEnd=function(t){this.checked?t.startX+4>t.currentX&&(this.checked=!1):t.startX-4<t.currentX&&(this.checked=!0),this.activated=!1,this.fireBlur(),this.startX=null},t.prototype.onSpace=function(t){this.toggle(),t.stopPropagation(),t.preventDefault()},t.prototype.toggle=function(){this.disabled||(this.checked=!this.checked,this.fireFocus())},t.prototype.fireFocus=function(){this.hasFocus||(this.hasFocus=!0,o.emit(this,"ionFocus"))},t.prototype.fireBlur=function(){this.hasFocus&&(this.hasFocus=!1,o.emit(this,"ionBlur"))},t.prototype.render=function(){return e(this,e("ion-gesture",o.theme(this,"toggle",{class:{"toggle-activated":this.activated,"toggle-checked":this.checked,"toggle-disabled":this.disabled},props:{canStart:this.canStart.bind(this),onStart:this.onDragStart.bind(this),onMove:this.onDragMove.bind(this),onEnd:this.onDragEnd.bind(this),onPress:this.toggle.bind(this),gestureName:"toggle",gesturePriority:30,type:"pan,press",direction:"x",threshold:20,listenOn:"parent"}}),[e("div.toggle-icon",e("div.toggle-inner")),e("div.toggle-cover",{attrs:{id:this.id,"aria-checked":!!this.checked&&"true","aria-disabled":!!this.disabled&&"true","aria-labelledby":this.labelId,role:"checkbox",tabindex:0}})]))},t}();t.Toggle=i},["ion-toggle","Toggle",[["onSpace","keydown.space",0,0,1]],[["checked","changed"]],1,2,":host,ion-toggle{display:inline-block;visibility:inherit!important;contain:content}ion-gesture{display:block;visibility:inherit!important}.toggle-cover{position:absolute;top:0;left:0;width:100%;height:100%;border:0;background:0 0;font-family:inherit;font-style:inherit;font-variant:inherit;line-height:1;text-transform:none;cursor:pointer;outline:0}.toggle-md{position:relative;padding:12px;width:36px;height:14px;box-sizing:content-box;contain:strict}.toggle-md .toggle-icon{position:relative;display:block;width:100%;height:100%;border-radius:14px;background-color:#dedede;transition:background-color .3s;pointer-events:none}.toggle-md .toggle-inner{position:absolute;top:-3px;left:0;width:20px;height:20px;border-radius:50%;background-color:#fff;box-shadow:0 2px 2px 0 rgba(0,0,0,.14),0 3px 1px -2px rgba(0,0,0,.2),0 1px 5px 0 rgba(0,0,0,.12);transition-duration:.3s;transition-property:transform,background-color;will-change:transform,background-color;contain:strict}.toggle-md.toggle-checked .toggle-icon{background-color:#b2ceff}.toggle-md.toggle-checked .toggle-inner{background-color:#327eff;transform:translate3d(16px,0,0)}.item-md.item-toggle-disabled ion-label,.toggle-md.toggle-disabled{opacity:.3;pointer-events:none}.toggle-md.toggle-disabled ion-radio{opacity:.3}.item-md .toggle-md{margin:0;padding:12px 8px 12px 16px;cursor:pointer}.item-md .toggle-md[item-left]{padding:12px 18px 12px 2px}.item-md.item-toggle ion-label{margin-left:0}.toggle-md-primary.toggle-checked .toggle-icon{background-color:#b2ceff}.toggle-md-primary.toggle-checked .toggle-inner{background-color:#327eff}.toggle-md-secondary.toggle-checked .toggle-icon{background-color:#9eeeb6}.toggle-md-secondary.toggle-checked .toggle-inner{background-color:#32db64}.toggle-md-danger.toggle-checked .toggle-icon{background-color:#fbb6b6}.toggle-md-danger.toggle-checked .toggle-inner{background-color:#f53d3d}.toggle-md-light.toggle-checked .toggle-icon{background-color:#fff}.toggle-md-light.toggle-checked .toggle-inner{background-color:#f4f4f4}.toggle-md-dark.toggle-checked .toggle-icon{background-color:#626262}.toggle-md-dark.toggle-checked .toggle-inner{background-color:#222}"]);