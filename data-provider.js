function DataProvider(){
     function getXML(url, callback) {
            $.ajax({
                type: 'GET',
                url: url,
                dataType: 'xml',
                success: callback,
                error: function (err) {
                    console.log(err);
                }
            });
        }
    this.getXml = getXML;
}
