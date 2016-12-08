MyGame.prototype = Object.create(Game.prototype);
function MyGame() {
    Game.call(this);
    var me = this;
    me.pages = [];
    var dataProvider = new DataProvider();
    function initLoad() {
        dataProvider.getXml('https://rawgit.com/aspjscoe/sample1/master/main.xml' + "?" + new Date().getTime(), function (result) {
            processElements(result);
            me.Initiate(result);
        });
    };
    this.initLoad = initLoad;
    this.load = function () {        
        initLoad();
    }
    //process elements
    function processElements(doc) {
        for (var i = 0; i < doc.documentElement.children.length; i++) {
            var element = doc.documentElement.children[i];
            element.setAttribute("ref", element.getAttribute("ref") + "?" + new Date().getTime());           
        }
    }
}
