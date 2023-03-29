!function(t,e){if("object"==typeof exports&&"object"==typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var i=e();for(var s in i)("object"==typeof exports?exports:t)[s]=i[s]}}(self,(function(){return(()=>{"use strict";var t={d:(e,i)=>{for(var s in i)t.o(i,s)&&!t.o(e,s)&&Object.defineProperty(e,s,{enumerable:!0,get:i[s]})},o:(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r:t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},e={};t.r(e),t.d(e,{PardusOptions:()=>A,PardusOptionsUtility:()=>i});class i{static defaultSaveFunction(t,e){return GM_setValue(t,e)}static defaultGetFunction(t,e=null){return GM_getValue(t,e)}static defaultDeleteFunction(t){return GM_deleteValue(t)}static getUniverse(){switch(document.location.hostname){case"orion.pardus.at":return"orion";case"artemis.pardus.at":return"artemis";case"pegasus.pardus.at":return"pegasus";default:throw new Error("Unable to determine universe")}}static getVariableName(t){return`${this.getUniverse()}_${t}`}static getVariableValue(t,e=null){return this.defaultGetFunction(this.getVariableName(t),e)}static setVariableValue(t,e){return this.defaultSaveFunction(this.getVariableName(t),e)}static deleteVariableValue(t){return this.defaultDeleteFunction(this.getVariableName(t))}static setActiveTab(t){window.localStorage.setItem("pardusOptionsOpenTab",t),window.dispatchEvent(new window.Event("storage"))}static getImagePackUrl(){return String(document.querySelector("body").style.backgroundImage).replace(/url\("*|"*\)|[a-z0-9]+\.gif/g,"")}static addGlobalListeners(){EventTarget.prototype.addPardusKeyDownListener=function(t,e=null,s,n=!1){const r=i.getVariableValue(t,e);if(!r)throw new Error(`No Pardus variable ${t} defined!`);this.addEventListener("keydown",(t=>{t.isComposing||229===t.keyCode||t.repeat||t.keyCode===r.code&&s()}),n)}}}class s{constructor(t){if(!t||""===t)throw new Error("Id cannot be empty.");if(!RegExp("^[a-zA-Z][\\w:.-]*$").test(t))throw new Error(`Id '${t}' is not a valid HTML identifier.`);this.id=t,this.afterRefreshHooks=[],this.beforeRefreshHooks=[]}addEventListener(t,e){this.getElement()&&this.getElement().addEventListener(t,e,!1),this.addAfterRefreshHook((()=>{this.getElement()&&this.getElement().addEventListener(t,e,!1)}))}removeEventListener(t,e){this.getElement()&&this.getElement().removeEventListener(t,e)}toString(){return`<div id='${this.id}'></div>`}beforeRefreshElement(){for(const t of this.beforeRefreshHooks)t()}afterRefreshElement(t={}){for(const e of this.afterRefreshHooks)e(t)}addAfterRefreshHook(t){this.afterRefreshHooks.push(t)}refreshElement(){this.beforeRefreshElement(),this.getElement().replaceWith(this.toElement()),this.afterRefreshElement()}getOffsetTop(){let t=this.getElement().offsetTop+this.getElement().offsetHeight,e=this.getElement().offsetParent;for(;null!==e;)t+=e.offsetTop,e=e.offsetParent;return t}getOffsetLeft(){let t=this.getElement().offsetLeft,e=this.getElement().offsetParent;for(;null!==e;)t+=e.offsetLeft,e=e.offsetParent;return t}getElement(){return document.getElementById(this.id)}toElement(){const t=document.createElement("template");return t.innerHTML=this.toString(),t.content.firstChild}appendChild(t){return document.getElementById(this.id).appendChild(t)}appendTableChild(t){return document.getElementById(this.id).firstChild.appendChild(t)}}class n extends s{constructor({id:t}){super(t),this.contents="",this.title="",this.addEventListener("click",(()=>{this.hide()}))}setContents({contents:t="",title:e=""}){this.contents=t,this.title=e,this.refreshElement()}setPosition({element:t,position:e="right"}){let i=15,s=-13;switch(e){case"left":i+=-220;break;case"er":i+=128;break;case"lf":i+=-160,s+=-310}this.getElement().style.top=`${t.getOffsetTop()+s}px`,this.getElement().style.left=`${t.getOffsetLeft()+i}px`}show(){this.getElement().removeAttribute("hidden")}hide(){this.getElement().setAttribute("hidden","")}toString(){return`<div id="${this.id}" hidden="" style="position: absolute; width: 200px; z-index: 100; border: 1pt black solid; background: #000000; padding: 0px;"><table class="messagestyle" style="background:url(${i.getImagePackUrl()}bgd.gif)" width="100%" cellspacing="0" cellpadding="3"><tbody><tr><td style="text-align:left;background:#000000;"><b>${this.title}</b></td></tr><tr><td style="text-align:left;">${this.contents}</td></tr><tr><td height="5"><spacer type="block" width="1" height="1"></spacer></td></tr><tr><td style="text-align:right;background:#31313A;"><b>GNN Library</b><img src="${i.getImagePackUrl()}info.gif" width="10" height="12" border="0"></td></tr></tbody></table></div>`}}class r extends s{constructor({id:t,hidden:e=!1}){super(t),this.hidden=e,this.labels=[],this.addAfterRefreshHook((()=>{for(const t of this.labels)t.afterRefreshElement()}))}addLabel({label:t}){this.labels.push(t),this.getElement()&&(this.appendChild(t.toElement()),t.afterRefreshElement())}show(){this.hidden=!1,this.refreshElement()}hide(){this.hidden=!0,this.refreshElement()}toString(){return this.hidden?`<tr id="${this.id}" cellspacing="0" cellpadding="0" border="0" hidden="">${this.labels.join("")}</tr>`:`<tr id="${this.id}" cellspacing="0" cellpadding="0" border="0">${this.labels.join("")}</tr>`}}class o extends s{constructor({id:t}){super(t),this.tabsRow=new r({id:`${this.id}-row`})}addLabel({label:t}){this.tabsRow.addLabel({label:t})}toString(){return`<table id="${this.id}" cellspacing="0" cellpadding="0" border="0" align="left"><tbody>${this.tabsRow}</tbody></table>`}}class a extends s{constructor({id:t}){super(t)}addContent({content:t}){this.appendChild(document.createElement("div").appendChild(t.toElement())),t.afterRefreshElement({maintainRefreshStatus:!0})}toString(){return`<tr id="${this.id}" cellspacing="0" cellpadding="0" border="0"></tr>`}}class d extends s{constructor({id:t,heading:e,active:s=!1,padding:n="0px"}){super(t),this.padding=n,this.heading=e,this.active=s,this.addEventListener("mouseover",(()=>{this.active||(this.getElement().style.backgroundImage=`url(${i.getImagePackUrl()}tabactive.png)`),this.getElement().style.cursor="default"})),this.addEventListener("mouseout",(()=>{this.active||(this.getElement().style.backgroundImage=`url(${i.getImagePackUrl()}tab.png)`,this.getElement().style.cursor="default")}))}toString(){const t=this.active?"tabactive":"tab";return`<td id="${this.id}" style="background: transparent url(&quot;${i.getImagePackUrl()}${t}.png&quot;) no-repeat scroll 0% 0%; background-size: cover; cursor: default; padding-left: ${this.padding}; padding-right: ${this.padding}" class="tabcontent">${this.heading}</td>`}setActive(){this.getElement().style.backgroundImage=`url('${i.getImagePackUrl()}tabactive.png')`,this.active=!0}setInactive(){this.getElement().style.backgroundImage=`url('${i.getImagePackUrl()}tab.png')`,this.active=!1}}class l extends s{constructor({id:t,premium:e=!1,actionText:i="",actionPerformedText:s=""}){super(t),this.premium=e,this.premium?this.colour="#FFCC11":this.colour="#D0D1D9",this.actionText=i,this.actionPerformedText=s,this.disabled=!1,this.style=`color: ${this.colour}`}toString(){return`<input value="${this.actionText}" id="${this.id}" type="button" style="${this.style}" ${this.disabled?"disabled":""}>`}setActionText(t="",e=""){this.actionText=t,this.actionPerformedText=e,this.refreshElement()}displayClicked(){this.getElement().setAttribute("disabled","true"),this.getElement().value=this.actionPerformedText,this.getElement().setAttribute("style","color:green;background-color:silver"),setTimeout((()=>{this.getElement().removeAttribute("disabled"),this.getElement().value=this.actionText,this.premium?this.getElement().setAttribute("style","color:#FFCC11"):this.getElement().removeAttribute("style")}),2e3)}disable(){this.disabled=!0,this.style="color: #B5B5B5;background-color: #CCCCCC;",this.getElement()&&(this.getElement().setAttribute("disabled","true"),this.getElement().setAttribute("style",this.style))}enable(){this.disabled=!1,this.style=`color: ${this.colour}`,this.getElement()&&(this.getElement().removeAttribute("disabled"),this.getElement().setAttribute("style",this.style))}}class h extends l{constructor({id:t,premium:e=!1}){super({id:t,premium:e,actionText:"Save",actionPerformedText:"Saved"})}displaySaved(){this.displayClicked()}}class u extends l{constructor({id:t,premium:e=!1}){super({id:t,premium:e,actionText:"Reset",actionPerformedText:"Reset"})}displayReset(){this.displayClicked()}}class c extends s{constructor({id:t,premium:e=!1,resetButton:i=!1}){super(t),this.premium=e,this.saveButton=new h({id:`${this.id}-button`,premium:e}),this.resetButton=i?new u({id:`${this.id}-reset-button`,premium:e}):null}toString(){return`<tr id="${this.id}"><td align="right">${this.resetButton?`${this.resetButton}&nbsp`:""}${this.saveButton}</td></tr>`}displaySaved(){this.saveButton.displaySaved()}displayReset(){this.resetButton&&this.resetButton.displayReset()}addSaveEventListener(t){this.saveButton.addEventListener("click",t)}addResetEventListener(t){this.resetButton&&this.resetButton.addEventListener("click",t)}}class p extends l{constructor({id:t,premium:e=!1}){super({id:t,premium:e,actionText:"Load",actionPerformedText:"Loaded"})}displayLoaded(){this.displayClicked()}}class g extends s{constructor({id:t,defaultValue:e=""}){super(t),this.defaultValue=e}toString(){return`<input id="${this.id}" type="text" value="${this.getValue()}"></input>`}save(){i.defaultSaveFunction(`${i.getVariableName(this.id)}`,this.getCurrentValue())}hasValue(){return!!i.defaultGetFunction(`${i.getVariableName(this.id)}`,!1)}getInputElement(){return document.getElementById(this.id)}getCurrentValue(){return this.getInputElement().value}getValue(){return i.defaultGetFunction(`${i.getVariableName(this.id)}`,this.defaultValue)}}class f extends s{constructor({id:t,premium:e=!1,presetNumber:i}){super(t),this.premium=e,this.saveButton=new h({id:`${this.id}-save-button`,premium:e}),this.loadButton=new p({id:`${this.id}-load-button`,premium:e}),this.presetNumber=i,this.label=new g({id:`${this.id}-label`,defaultValue:`Preset ${this.presetNumber}`}),this.hasValue()||this.loadButton.disable()}toString(){return`<tr id="${this.id}"><td align="left">${this.label}</input></td><td align="right">${this.loadButton} ${this.saveButton}</td></tr>`}displaySaved(){this.saveButton.displaySaved()}displayLoaded(){this.loadButton&&this.loadButton.displayLoaded()}hasValue(){return this.label.hasValue()}setFunctions(t){0!==t.length&&(this.addSaveEventListener((()=>{for(const e of t)e.saveValue(((t,i)=>{e.saveFunction(`preset-${this.presetNumber}-${t}`,i)}));this.displaySaved(),this.loadButton.enable(),this.label.save();const e=new Event("preset-save");this.getElement().dispatchEvent(e)})),this.addLoadEventListener((()=>{for(const e of t)e.loadValue(e.getValue(((t,i)=>e.getFunction(`preset-${this.presetNumber}-${t}`,i))));this.displayLoaded();const e=new Event("preset-load");this.getElement().dispatchEvent(e)})))}addSaveEventListener(t){this.saveButton.addEventListener("click",t)}addLoadEventListener(t){this.loadButton&&this.loadButton.addEventListener("click",t)}}class m extends s{constructor({id:t,premium:e=!1,presets:i=0}){super(t),this.premium=e,this.presets=[];for(let t=0;t<i;t+=1)this.presets.push(new f({id:`${this.id}-preset-row-${t}`,premium:e,presetNumber:t+1}))}toString(){if(0===this.presets.length)return"";let t=`<tr id="${this.id}"><td><table width="100%">`;for(const e of this.presets)t+=e;return`${t}</table></td></tr>`}setFunctions(t){for(const e of this.presets)e.setFunctions(t)}}class b extends s{constructor({id:t,description:e,title:i,tipBoxPosition:s="right"}){super(t),this.description=e,this.title=i,this.tipBoxPosition=s,this.addEventListener("mouseover",(()=>{this.tipBox=A.getDefaultTipBox(),this.tipBox.setContents({title:this.title,contents:this.description}),this.tipBox.setPosition({element:this,position:this.tipBoxPosition}),this.tipBox.show()})),this.addEventListener("mouseout",(()=>{this.tipBox.hide()}))}toString(){return`<a id="${this.id}" href="#" onclick="return false;"><img src="${i.getImagePackUrl()}info.gif" class="infoButton" alt=""></a>`}}class v extends s{constructor({id:t,variable:e,description:s="",defaultValue:n=!1,saveFunction:r=i.defaultSaveFunction,getFunction:o=i.defaultGetFunction,shallow:a=!1,reverse:d=!1,info:l=null}){super(t),this.variable=e,this.saveFunction=r,this.getFunction=o,this.description=s,this.info=l,this.defaultValue=n,this.inputId=`${this.id}-input`,this.shallow=a,this.reverse=d,null!==this.info?(this.infoElement=new b({id:`${this.id}-info`,description:this.info.description,title:this.info.title}),this.addAfterRefreshHook((()=>{this.infoElement.afterRefreshElement()}))):this.infoElement=""}toString(){return this.shallow?`<td id='${this.id}'>${this.getInnerHTML()}<label>${this.description}</label>${this.infoElement}</td>`:this.reverse?`<tr id='${this.id}'><td>${this.getInnerHTML()}</td><td><label for='${this.inputId}'>${this.description}</label>${this.infoElement}</td></tr>`:""===this.description?`<tr id='${this.id}'><td col="2">${this.getInnerHTML()}</td></tr>`:`<tr id='${this.id}'><td><label for='${this.inputId}'>${this.description}:</label>${this.infoElement}</td><td>${this.getInnerHTML()}</td></tr>`}getInnerHTML(){return""}getValue(t=null){return t&&"function"==typeof t?t(`${i.getVariableName(this.variable)}`,this.defaultValue):this.getFunction(`${i.getVariableName(this.variable)}`,this.defaultValue)}getCurrentValue(){return null}getInputElement(){return document.getElementById(this.inputId)}resetValue(){this.saveFunction(`${i.getVariableName(this.variable)}`,this.defaultValue)}saveValue(t=null){t&&"function"==typeof t?t(`${i.getVariableName(this.variable)}`,this.getCurrentValue()):this.saveFunction(`${i.getVariableName(this.variable)}`,this.getCurrentValue())}loadValue(t){this.getInputElement().value=t,this.saveValue()}}class $ extends v{getInnerHTML(){let t="";return!0===this.getValue()&&(t=" checked"),`<input id="${this.inputId}" type="checkbox"${t}>`}getCurrentValue(){return this.getInputElement().checked}}class y extends v{constructor({id:t,variable:e,description:s,defaultValue:n=0,saveFunction:r=i.defaultSaveFunction,getFunction:o=i.defaultGetFunction,info:a=null,rows:d=3,cols:l=65}){super({id:t,variable:e,description:s,defaultValue:n,saveFunction:r,getFunction:o,info:a}),this.rows=d,this.cols=l}getInnerHTML(){return`<textarea id="${this.inputId}" autocomplete="off" autocorrect="off" spellcheck="false" ${0===this.rows?"":`rows="${this.rows}"`} ${0===this.cols?"":`cols="${this.cols}"`} style="font-family: Helvetica, Arial, sans-serif;background-color:#00001C; color:#D0D1D9; font-size:11px;">${this.getValue()}</textarea>`}getCurrentValue(){return this.getInputElement().value}}class E extends v{constructor({id:t,variable:e,description:s,defaultValue:n=0,saveFunction:r=i.defaultSaveFunction,getFunction:o=i.defaultGetFunction,min:a=0,max:d=0,step:l=1,info:h=null}){super({id:t,variable:e,description:s,defaultValue:n,saveFunction:r,getFunction:o,info:h}),this.minValue=a,this.maxValue=d,this.stepValue=l}getInnerHTML(){return`<input id="${this.inputId}" type="number" min="${this.minValue}" max="${this.maxValue}" step="${this.stepValue}" value="${this.getValue()}">`}getCurrentValue(){return this.getInputElement().value}}class x extends l{constructor({id:t,premium:e=!1}){super({id:t,premium:e,actionText:"Set Key"})}displayClicked(t=!0){t?this.setActionText("Cancel"):this.setActionText("Set Key")}}class F extends v{constructor(t){super(t),this.setKeyButton=new x({id:`${this.id}-setkey`}),this.addAfterRefreshHook(this.initialSetKeyListener.bind(this))}initialSetKeyListener(){this.setKeyButton.addEventListener("click",this.setKeyListener.bind(this))}setKeyListener(){this.setKeyButton.displayClicked(!0),document.getElementById(`${this.inputId}-key`).value="_",document.getElementById(`${this.inputId}-key`).style.color="lime",document.addEventListener("keydown",this.captureKeyListener.bind(this),{once:!0}),this.setKeyButton.addEventListener("click",this.cancelHandler.bind(this))}captureKeyListener(t){this.getInputElement().value=JSON.stringify({code:t.keyCode,key:t.code,description:t.key}),this.setKeyButton.displayClicked(!1),document.getElementById(`${this.inputId}-key`).value=this.getCurrentKeyDescription(),document.getElementById(`${this.inputId}-key`).style.color="#D0D1D9",this.setKeyButton.removeEventListener("click",this.cancelHandler)}cancelHandler(){document.removeEventListener("keydown",this.captureKeyListener)}getInnerHTML(){let t=`<input id="${this.inputId}" type="text" hidden value='${JSON.stringify(this.getValue())}'>`;return t+=`<table width="100%"><tbody><tr><td align="left"><input id="${this.inputId}-key" type="text" cols="1" maxlength="1" readonly value="${this.getKeyDescription()}" style="width: 20px;padding: 2px;text-align: center;margin: 2px 7px 2px;"/></td><td align="right">${this.setKeyButton}</td></tr></tbody></table>`,t}getKey(){return this.getValue().key}getKeyDescription(){return this.getValue().description}getKeyCode(){return this.getValue().code}getCurrentKey(){return this.getCurrentValue().key}getCurrentKeyDescription(){return this.getCurrentValue().description}getCurrentCode(){return this.getCurrentValue().code}getCurrentValue(){return JSON.parse(this.getInputElement().value)}}class B extends v{constructor({id:t,variable:e,description:s,defaultValue:n=null,saveFunction:r=i.defaultSaveFunction,getFunction:o=i.defaultGetFunction,info:a=null,inheritStyle:d=!1,options:l=[]}){super({id:t,variable:e,description:s,defaultValue:n,saveFunction:r,getFunction:o,info:a}),this.options=l,d&&this.addEventListener("change",(()=>{this.updateSelectStyle()}))}getInnerHTML(){let t="";const e=this.getValue();let i=!1,s="";for(const n of this.options){const r=n.style?` style="${n.style}"`:"";i||n.value!==e&&(!n.default||!0!==n.default||e)?t+=`<option value=${n.value}${r}>${n.text}</option>`:(t+=`<option value=${n.value}${r} selected>${n.text}</option>`,i=!0,s=n.style?` style="${n.style}"`:"")}return t=`<select id="${this.inputId}"${s}>${t}`,t}updateSelectStyle(){const t=this.getInputElement().selectedOptions[0].getAttribute("style");this.getInputElement().setAttribute("style",t)}getOptions(){return this.options}setOptions(t=[]){this.options=t}getCurrentValue(){return this.getInputElement().value}}class w extends s{constructor({id:t,description:e,saveFunction:s=i.defaultSaveFunction,getFunction:n=i.defaultGetFunction}){super(t),this.description=e,this.saveFunction=s,this.getFunction=n,this.options=[]}toString(){return`<tr id="${this.id}"><td>${this.description}</td><td>${this.getInnerHTML()}</td></tr>`}getInnerHTML(){let t="<table><tbody><tr>";for(const e of this.options)t+=e;return t+="</tr></tbody></table>",t}saveValue(){for(const t of this.options)t.saveValue()}addBooleanOption({variable:t,description:e,defaultValue:i=!1,saveFunction:s=this.saveFunction,getFunction:n=this.getFunction}){const r={id:`${this.id}-option-${this.options.length}`,variable:t,description:e,defaultValue:i,saveFunction:s,getFunction:n,shallow:!0},o=new $(r);return this.options.push(o),this.refreshElement(),o}}class L extends s{constructor({id:t,premium:e=!1,saveFunction:s=i.defaultSaveFunction,getFunction:n=i.defaultGetFunction}){super(t),this.premium=e,this.saveFunction=s,this.getFunction=n,this.options=[],this.addAfterRefreshHook((()=>{for(const t of this.options)t.afterRefreshElement()}))}addBooleanOption(t){const e=new $({id:`${this.id}-option-${this.options.length}`,...t});return this.options.push(e),e}addTextAreaOption(t){const e=new y({id:`${this.id}-option-${this.options.length}`,...t});return this.options.push(e),e}addNumericOption(t){const e=new E({id:`${this.id}-option-${this.options.length}`,...t});return this.options.push(e),e}addKeyDownOption(t){const e=new F({id:`${this.id}-option-${this.options.length}`,...t});return this.options.push(e),e}addSelectOption(t){const e=new B({id:`${this.id}-option-${this.options.length}`,...t});return this.options.push(e),e}addGroupedOption({description:t,saveFunction:e=this.saveFunction,getFunction:i=this.getFunction}){const s=new w({id:`${this.id}-option-${this.options.length}`,description:t,saveFunction:e,getFunction:i});return this.options.push(s),s}toString(){return 0===this.options.length?`<tr id="${this.id}" style="display: none;"><td><table><tbody></tbody></table></td></tr>`:`<tr id="${this.id}"><td><table><tbody>${this.options.join("")}</tbody></table></td></tr>`}}class k extends s{constructor({id:t,description:e="",imageLeft:i="",imageRight:s=""}){super(t),this.backContainer="",this.description=e,this.imageLeft=i,this.imageRight=s,this.alignment="",this.frontContainer={styling:'style="display: none;"',id:"",setId(t){this.id=t},setStyle(t){this.styling=`style="${t}"`},toString:()=>""},this.frontContainer.setId(t)}addImageLeft(t){this.imageLeft=t,this.refreshElement()}addImageRight(t){this.imageRight=t,this.refreshElement()}setDescription(t){this.description=t,this.refreshElement()}setAlignment(t){this.alignment=t,this.refreshElement()}toString(){let t=`<tr id=${this.id} style=''><td><table><tbody><tr>`;return this.imageLeft&&""!==this.imageLeft&&(t=`${t}<td><img src="${this.imageLeft}"></td>`),t=""===this.alignment?""===this.imageLeft&&""===this.imageRight?`${t}<td align="left">${this.description}</td>`:`${t}<td align="center">${this.description}</td>`:`${t}<td align="${this.alignment}">${this.description}</td>`,this.imageRight&&""!==this.imageRight&&(t=`${t}<td><img src="${this.imageRight}"></td>`),`${t}</tr></tbody></table></td></tr>`}}class T extends s{constructor({id:t,heading:e,premium:s=!1,description:n="",imageLeft:r="",imageRight:o="",saveFunction:a=i.defaultSaveFunction,getFunction:d=i.defaultGetFunction,refresh:l=!0,resetButton:h=!1,presets:u=0}){super(t),this.heading=e,this.premium=s,this.saveFunction=a,this.getFunction=d,this.refresh=l,this.resetButton=h;const p=s?'<th class="premium">':"<th>";this.frontContainer=`<form id="${this.id}" action="none"><table style="background:url(${i.getImagePackUrl()}bgd.gif)" width="100%" cellpadding="3" align="center"><tbody><tr>${p}${e}</th></tr>`,this.backContainer="</tbody></table></form>",this.innerHtml="",this.description=new k({id:`${this.id}-description`,description:n,imageLeft:r,imageRight:o}),this.optionsGroup=new L({id:`${this.id}-options-group`,premium:s,saveFunction:a,getFunction:d}),this.saveButtonRow=new c({id:`${this.id}-save`,premium:s,resetButton:h}),this.presets=new m({id:`${this.id}-presets`,premium:s,presets:u}),this.addAfterRefreshHook((t=>{t.maintainRefreshStatus||(this.refresh=!0)})),this.addAfterRefreshHook((()=>{this.optionsGroup.afterRefreshElement(),this.saveButtonRow.afterRefreshElement()})),this.addAfterRefreshHook((()=>{this.setFunctions()}))}toString(){return 0===this.optionsGroup.options.length?this.frontContainer+this.description+this.innerHtml+this.optionsGroup+this.backContainer:this.frontContainer+this.description+this.innerHtml+this.optionsGroup+this.saveButtonRow+this.presets+this.backContainer}setFunctions(){0!==this.optionsGroup.options.length&&(this.saveButtonRow.addSaveEventListener((()=>{for(const t of this.optionsGroup.options)t.saveValue();this.saveButtonRow.displaySaved();const t=new Event("save");this.getElement().dispatchEvent(t)})),this.saveButtonRow.addResetEventListener((()=>{for(const t of this.optionsGroup.options)t.resetValue();this.saveButtonRow.displayReset(),this.optionsGroup.refreshElement();const t=new Event("reset");this.getElement().dispatchEvent(t)}))),this.presets.setFunctions(this.optionsGroup.options)}addSaveEventListener(t){return this.saveButtonRow.addSaveEventListener(t)}addBooleanOption({refresh:t=this.refresh,...e}){const i=this.optionsGroup.addBooleanOption(e);return t&&this.refreshElement(),i}addTextAreaOption({refresh:t=this.refresh,...e}){const i=this.optionsGroup.addTextAreaOption(e);return t&&this.refreshElement(),i}addNumericOption({refresh:t=this.refresh,...e}){const i=this.optionsGroup.addNumericOption(e);return t&&this.refreshElement(),i}addKeyDownOption({refresh:t=this.refresh,...e}){const i=this.optionsGroup.addKeyDownOption(e);return t&&this.refreshElement(),i}addSelectOption({refresh:t=this.refresh,...e}){const i=this.optionsGroup.addSelectOption(e);return t&&this.refreshElement(),i}addGroupedOption({description:t,saveFunction:e=this.saveFunction,getFunction:i=this.getFunction,refresh:s=this.refresh}){const n={description:t,saveFunction:e,getFunction:i},r=this.optionsGroup.addGroupedOption(n);return s&&this.refreshElement(),r}}class S extends s{constructor({id:t,content:e=null,saveFunction:s=i.defaultSaveFunction,getFunction:n=i.defaultGetFunction,refresh:r=!0,active:o=!0}){super(t),this.content=e,this.saveFunction=s,this.getFunction=n,this.leftBoxes=[],this.rightBoxes=[],this.topBoxes=[],this.refresh=r,this.active=o,this.addAfterRefreshHook((t=>{t.maintainRefreshStatus||(this.refresh=!0)})),this.addAfterRefreshHook((()=>{for(const t of this.leftBoxes)t.afterRefreshElement();for(const t of this.rightBoxes)t.afterRefreshElement()}))}addBox({top:t=!1,...e}){let i=null;return i=t?this.addBoxTop(e):this.leftBoxes.length<=this.rightBoxes.length?this.addBoxLeft(e):this.addBoxRight(e),i}addBoxTop({refresh:t=this.refresh,...e}){const i=new T({id:`${this.id}-top-box-${this.topBoxes.length}`,refresh:t,...e});return this.topBoxes.push(i),t&&this.refreshElement(),i}addBoxLeft({refresh:t=this.refresh,...e}){const i=new T({id:`${this.id}-left-box-${this.leftBoxes.length}`,refresh:t,...e});return this.leftBoxes.push(i),t&&this.refreshElement(),i}addBoxRight({refresh:t=this.refresh,...e}){const i=new T({id:`${this.id}-right-box-${this.rightBoxes.length}`,refresh:t,...e});return this.rightBoxes.push(i),t&&this.refreshElement(),i}addPremiumBox(t){return this.addBox({premium:!0,...t})}addPremiumBoxLeft(t){return this.addBoxLeft({premium:!0,...t})}addPremiumBoxRight(t){return this.addBoxRight({premium:!0,...t})}toString(){if(null!==this.content)return this.content;const t=this.active?"":"hidden";return`<tr id="${this.id}" ${t}><td><table width="100%" align="center"><tbody><tr><td id="${this.id}-top" colspan="3" valign="top">${this.topBoxes.join("<br><br>")}${this.topBoxes.length>0?"<br><br>":""}</td></tr><tr><td id="${this.id}-left" width="350" valign="top">${this.leftBoxes.join("<br><br>")}</td><td width="40"></td><td id="${this.id}-right" width="350" valign="top">${this.rightBoxes.join("<br><br>")}</td></tr></tbody></table></td></tr>`}setActive(){this.active=!0,this.getElement().removeAttribute("hidden")}setInactive(){this.active=!1,this.getElement().setAttribute("hidden","")}}class V{constructor({id:t,label:e,saveFunction:s=i.defaultSaveFunction,getFunction:n=i.defaultGetFunction,refresh:r=!0,active:o=!1,padding:a}){this.id=t,this.active=o,this.label=new d({id:`${this.id}-label`,heading:e,active:this.active,padding:a}),this.content=new S({id:`${this.id}-content`,saveFunction:s,getFunction:n,refresh:r,active:this.active})}setActive(){!0!==this.active&&(this.active=!0,this.label.setActive(),this.content.setActive())}setInactive(){!1!==this.active&&(this.active=!1,this.label.setInactive(),this.content.setInactive())}afterRefreshElement(t){this.label.afterRefreshElement(t),this.content.afterRefreshElement(t)}getLabel(){return this.label}getContent(){return this.content}toString(){return this.content.toString()}}class I extends s{constructor({id:t}){super(t)}toString(){return`<tr id="${this.id}"><td align="right" style="font-size:11px;color:#696988;padding-right:7px;padding-top:5px">Version ${GM_info.script.version}</td></tr>`}}class R extends s{constructor({id:t,heading:e,defaultLabel:s="Default tab",content:n=null,saveFunction:o=i.defaultSaveFunction,getFunction:a=i.defaultGetFunction,refresh:d=!0}){super(t),this.heading=e,this.content=n,this.saveFunction=o,this.getFunction=a,this.subTabsRow=new r({id:`${this.id}-tabsrow`}),this.refresh=d,this.subTabs=[],this.defaultTab=this.addSubTab({label:s,saveFunction:this.saveFunction,getFunction:this.getFunction,refresh:!1,active:!0}),this.versionRow=new I({id:`${this.id}-versionrow`}),this.addAfterRefreshHook((t=>{t.maintainRefreshStatus||(this.refresh=!0)})),this.addAfterRefreshHook((t=>{if(this.refresh||!t.maintainRefreshStatus)for(const e of this.subTabs)e.afterRefreshElement(t)}))}addSubTab({label:t,saveFunction:e=this.saveFunction,getFunction:i=this.getFunction,refresh:s=this.refresh,active:n=!1,padding:r}){const o=new V({id:`${this.id}-subtab-${this.subTabs.length}`,label:t,saveFunction:e,getFunction:i,refresh:s,active:n,padding:r}),a=o.getContent(),d=o.getLabel();return this.subTabsRow.addLabel({label:d}),this.subTabs.push(o),d.addEventListener("click",(()=>{this.setActiveSubTab(o.id)})),s&&this.refreshElement(),a}setActiveSubTab(t){for(const e of this.subTabs)e.id===t?e.setActive():e.setInactive()}addBox(t){return this.defaultTab.addBox(t)}addBoxTop(t){return this.defaultTab.addBoxTop(t)}addBoxLeft(t){return this.defaultTab.addBoxLeft(t)}addBoxRight(t){return this.defaultTab.addBoxRight(t)}addPremiumBox(t){return this.defaultTab.addPremiumBox(t)}addPremiumBoxLeft(t){return this.defaultTab.addPremiumBoxLeft(t)}addPremiumBoxRight(t){return this.defaultTab.addPremiumBoxRight(t)}setActive(){this.getElement().removeAttribute("hidden")}setInactive(){this.getElement().setAttribute("hidden","")}toString(){if(null!==this.content)return this.content;const t=this.subTabs.length>1?"":"hidden",e=this.subTabs.length>1?'class="tabstyle"':"";return`<table id="${this.id}" hidden class="tabstyle" style="background:url(${i.getImagePackUrl()}bgdark.gif)" cellspacing="0" cellpadding="0" border="0"><tbody><tr><td><div align="center"><h1>${this.heading}</h1></div></td></tr><tr><td><table width="100%" align="center" cellspacing="0" cellpadding="0" border="0"><tbody><tr><td><table cellspacing="0" cellpadding="0" border="0" ${t}><tbody>${this.subTabsRow}</tbody></table></td></tr><tr><td><table ${e} cellspacing="0" cellpadding="0" border="0"><tbody>${this.subTabs.join("")}</tbody></table></td></tr></tbody></table></td></tr>${this.versionRow}</tbody></table>`}}class C{constructor({id:t,heading:e,content:s=null,saveFunction:n=i.defaultSaveFunction,getFunction:r=i.defaultGetFunction,refresh:o=!0,defaultLabel:a}){this.id=t,this.heading=e,this.content=new R({id:`options-content-${this.id}`,heading:e,content:s,saveFunction:n,getFunction:r,refresh:o,defaultLabel:a}),this.label=new d({id:`${this.id}-label`,heading:e}),this.active=!1,this.saveFunction=n,this.getFunction=r}addListeners(){this.getLabel().addEventListener("click",(()=>i.setActiveTab(this.id)),!0),window.addEventListener("storage",(()=>{window.localStorage.getItem("pardusOptionsOpenTab")!==this.id||this.active||this.setActive(),window.localStorage.getItem("pardusOptionsOpenTab")!==this.id&&this.active&&this.setInactive()}))}setActive(){this.label.setActive(),this.content.setActive(),this.active=!0}setInactive(){this.label.setInactive(),this.content.setInactive(),this.active=!1}getContent(){return this.content}getLabel(){return this.label}}class A{static init(){if(document.getElementById("options-area"))return;const t=document.getElementsByTagName("table")[2],e=t.parentNode;t.setAttribute("id","options-content-pardus-default"),t.setAttribute("class","tabstyle"),t.remove(),e.appendChild(this.getPardusOptionsElement());const s=this.createDefaultTipBox();e.appendChild(s.toElement()),this.addTab({id:"pardus-default",heading:"Pardus Options",content:t.outerHTML,refresh:!1}),i.setActiveTab("pardus-default")}static version(){return 1.6}static createDefaultTipBox(){return new n({id:"options-default-tip-box"})}static getDefaultTipBox(){const t=this.createDefaultTipBox();return t.refreshElement(),t}static getTabsElement(){return new o({id:"options-tabs"})}static getContentElement(){return new a({id:"options-content"})}static getPardusOptionsElement(){const t=document.createElement("template");return t.innerHTML=`<table id="options-area" cellspacing="0" cellpadding="0" border="0"><tbody><tr cellspacing="0" cellpadding="0" border="0"><td>${this.getTabsElement()}</td></tr>${this.getContentElement()}</tbody></table>`,t.content.firstChild}static addTab({id:t,heading:e,content:s=null,saveFunction:n=i.defaultSaveFunction,getFunction:r=i.defaultGetFunction,refresh:o=!0,defaultLabel:a}){const d=new C({id:t,heading:e,content:s,saveFunction:n,getFunction:r,refresh:o,defaultLabel:a});if(document.getElementById(d.id))throw new Error(`Tab '${d.id}' already exists!`);return this.getTabsElement().addLabel({label:d.getLabel()}),this.getContentElement().addContent({content:d.getContent()}),d.addListeners(),d.getContent()}}return"/options.php"===document.location.pathname&&A.init(),i.addGlobalListeners(),e})()}));