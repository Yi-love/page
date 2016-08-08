/**
 * Jin
 * [Page 分页]
 * @param {[number]} count    [页数]
 * @param {[String]} paramName[url参数名]
 * @param {[number]} current  [当前页]
 * @param {[string]} url      [URL]
 * @param {[number]} step     [显示区域大小]
 * @param {[string]} cssTxt   [css样式]
 * @param {[object]} params   [url参数]
 * @param {[string]} tmpl     [分页模版]
 * @param {[string]} foot     [分页辅助信息模版]
 * @param {[dom | jq.dom]} selector [要插入到的dom]
 * @param {[string]}className [当前页]
 * @param {[func]} formatPage [模版]
 * @param {[func]} formatFoot [辅助信息模版]
 *
 * eq:
 *   var pageBar = new Page({count : 10 , paramName: 'page' ,current: 1 , className:'current' , selector:$('#J_pageBar')});
 *   pageBar.render();
 */
function Page(paramsObj){
  if ( ({}).toString.call(paramsObj) !== '[object Object]' ) { throw new Error('Page need paramsObj => {}');}

  var arr = paramsObj.url ? paramsObj.url.split('?') : window.location.href.split('?');

  this.url       = arr[0];
  this.current   = paramsObj.current ? paramsObj.current : 1;
  this.params    = paramsObj.params ? paramssObj.param : this.getParams(arr[1]);
  this.paramName = paramsObj.paramName ? paramsObj.paramName : 'page';
  this.count     = paramsObj.count ? paramsObj.count : 1;
  this.step      = paramsObj.step ? paramsObj.step : 3;
  this.tmpl      = paramsObj.tmpl ? paramsObj.tmpl : '<a href="{{pageUrl}}" class="page-i {{className}}">{{num}}</a>';
  this.foot      = paramsObj.foot ? paramsObj.foot : '<span>共：{{current}}/'+this.count+'</span>';
  this.selector  = paramsObj.selector;
  this.className = paramsObj.className ? paramsObj.className : 'current';
  this.cssTxt    = paramsObj.cssTxt ? paramsObj.cssTxt : `.page-box{
                                                            padding: 10px 0;}
                                                          .page-box .page-i{
                                                            padding: 6px 10px;margin-right: 5px;border: 1px solid #e1e1e1;
                                                            background: #eee;border-radius: 2px;color: #666;cursor: pointer;}
                                                          .page-box .page-i:hover,.page-box .page-i.current{
                                                            color: #fff;background:rgb(92, 144, 210);border: 1px solid rgb(92, 144, 210);}`;
  if ( paramsObj.formatPage ) this.formatPage = paramsObj.formatPage;
  if ( paramsObj.formatFoot ) this.formatFoot = paramsObj.formatFoot;
  this.addCss();
};
/**
 * [getParams 获取url参数]
 * @param  {[String]} str [description]
 * @return {[Array]}     [description]
 */
Page.prototype.getParams = function(str) {
  var result = {} , arr = [];
  if ( !str ) return result;
  str = str.replace(/^\?/,'').split('&');
  for (var i = 0; i < str.length; i++) {
    arr = str[i].split('=');
    result[arr[0]] = arr[1];
  }
  return result;
};
/**
 * [addCss 添加css样式到页面头部]
 * @param {[String]} css [description]
 */
Page.prototype.addCss = function(css) {
  var style ,head , document = window && window.document;
  if ( !document ) return;
  css = css ? css : this.cssTxt;
  if ( document.all ) { //ie8
    style = document.createStyleSheet();
    style.cssText = this.cssTxt;
  }else{
    style = document.createElement("style");
    style.type = "text/css";
    style.textContent = this.cssTxt;
  }
  head = document.head ? document.head : document.getElementsByTagName('head')[0];
  head.appendChild(style);
  return this;
};
/**
 * [render 生成html]
 */
Page.prototype.render = function() {
  var result = '' ,
      start = this.current - this.step-1 > 0 ? this.current - this.step-1 : 0,
      end   = this.current + this.step < this.count ? this.current + this.step : this.count;

  if ( start === 0 ) {
    end = this.step*2 + 1 >= this.count ? this.count : this.step*2 + 1;
  }
  if ( end === this.count ) {
    start = (this.count - this.step*2 - 1) > 0 ? (this.count - this.step*2 - 1)  : 0;
  }
  if ( start !== 0 ) {
    result += this.formatPage( 1 , '' , '首页');
  }
  for ( var i = start ; i < end ; i++ ) {
      result += this.formatPage(i+1 , this.className , i+1);
  };
  if ( end !== this.count ) {
    result += this.formatPage( this.count , '' , '尾页');
  }
  result += this.formatFoot();
  return this.renderDom(result);
};

/**
 * [renderDom 渲染页面]
 * @param  {[type]} html [description]
 * @return {[type]}      [description]
 */
Page.prototype.renderDom = function(result) {
  if ( this.selector ) {
    if (this.selector.innerHTML) {
      this.selector.innerHTML = result;
      return this;
    }else if( this.selector.html ){
      this.selector.html(result);
      return this;
    }
  }
  return result;
};
/**
 * [getUrl 获取指定pagenum url]
 * @param  {[Number]} num [第几页]
 * @return {[type]}     [description]
 */
Page.prototype.getUrl = function(num) {
  var result = [];
  for (var name in this.params ) {
    if ( this.params.hasOwnProperty(name) && name != this.paramName ) {
      result.push(name+'='+this.params[name]);
    }
  }
  result.push(this.paramName+'='+ (num ? num : this.current));
  return this.url + '?' + result.join('&');
};
/**
 * [formatPage 生成pagenum url]
 * @param  {[type]} num       [description]
 * @param  {[type]} className [description]
 * @param  {[type]} desc      [description]
 * @return {[type]}           [description]
 */
Page.prototype.formatPage = function(num , className , desc) {
  return this.tmpl.replace(/\{\{className\}\}/g , num === this.current ? className : '')
                  .replace(/\{\{pageUrl\}\}/g , this.getUrl(num))
                  .replace(/\{\{num\}\}/g , desc ? desc : num);
};
/**
 * [formatFoot 生成辅助信息 foot ]
 * @return {[type]} [description]
 */
Page.prototype.formatFoot = function() {
  return this.foot.replace(/\{\{current\}\}/g ,this.current)
                  .replace(/\{\{count\}\}/g , this.count);
};
/**
 * [setCurrent 设置当前页]
 * @param {[type]} num [description]
 */
Page.prototype.setCurrent = function(num) {
  if ( typeof num === 'number' && num > 0 && num <= this.count ) {
    this.current = num;
  }
  return this.render();
};

module.exports = Page;
