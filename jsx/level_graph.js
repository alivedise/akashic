'use strict';

(function(exports) {
  exports.LevelGraph = React.createClass({
    getInitialProps: function() {
      return {
        members: []
      }
    },
    componentDidMount: function() {
      this.renderGraph();
    },
    renderGraph: function() {
      console.log('rendering');
      var root = this.getDOMNode();
      var datasetObj = {};
      this.props.members.map(function(member) {
        var rank = Number(member.rank.replace('Rank', ''));
        var rankBase = rank - rank%10;
        if (!datasetObj[rankBase]) {
          datasetObj[rankBase] = [];
        }
        datasetObj[rankBase].push(member);
      }, this);
      var dataset = [];
      for (var key in datasetObj) {
        dataset.push({
          h: datasetObj[key].length,
          text: key
        });
      }
      console.log(dataset);

      var w = dataset.length * 25 + 100,h = 50,padding = 2, barMargin = 2;
      //定義寬高,padding等等值

      var Ymax = d3.max(dataset, function(d) { return d.h; }),
        Ymin = d3.min(dataset, function(d) { return d.h; });
        //取得Y軸的最大值

      var xScale = d3.scale.linear() //產生一個屬於X軸的線性尺度
        .domain([0, dataset.length]) //傳入的值是原始資料的最小及最大值
        .range([padding , w - padding]) 
        //輸出的範圍是左邊的padd距離，到右邊的padding

      var yScale = d3.scale.linear()
        .domain([Ymin, Ymax])
        .range([padding, h - padding])
        //類似X軸的尺度
      var yScale = d3.scale.linear()
        .domain([Ymin, Ymax])
        .range([padding, h - padding])
        //類似X軸的尺度

      var colorScale = d3.scale.linear()
        .domain([Ymin, Ymax])
        .range([0, 700])
        //這次顏色都要用尺度來算

      var barWidth = (w - padding*2) / dataset.length - barMargin;

      var svg = d3.select(root).append('svg').attr({'width': w,'height': h})
        //接下來開始產生SVG
      svg.selectAll('rect').data(dataset).enter() //和先前一樣，選取'circle'並把資料加入
      .append('rect') // 增加圓到SVG內
      .attr({ //加入屬性到圓
        'x': function(d, i){return xScale(i)}, //利用尺度算出X的位置
        'y': function(d){return h - yScale(d.h)}, //同理算出Y
        'width': barWidth,
        'height':function(d){return yScale(d.h)}, //同理算出Y
        // 'r': function(d){return Math.sqrt(h - d[1])}, //圓的大小是高 - Y值的平方
        'fill': function(d){
          var color = 0.2 + colorScale(d.h) * 0.001;
          return  d3.hsl(200 ,color, color); //利用尺度來算出顏色
        },
        'title': function(d){
          return 'Name : ' + d.text;
        }
        //介紹一個顏色的function hsl，可以將顏色算出後轉成色碼
        //格式 (360色相, 1彩度, 1明度)
      });

      svg.selectAll('text').data(dataset).enter() //補上資料數值
      .append('text') 
      .text(function(d){ return d.h}) //將值寫到SVG上
      .attr({
        'x': function(d, i){return xScale(i) + barWidth/2}, //和上面相同，算出X、Y的位置
        'y': function(d){return h - yScale(d.h) + 15},
        'fill': 'white', //文字填滿為紅色
        'text-anchor': 'middle',
        'font-size': '10px' //Fill、font-size也可以用CSS寫喔～
      });

      svg.append('g').selectAll('text').data(dataset).enter() //這邊再多做一個人名顯示的區域
      .append('text') 
      .text(function(d){ return d.text}) //寫入人名
      .attr({
        'x': function(d, i){return xScale(i) + barWidth/2}, //和上面相同，算出X、Y的位置
        'y': function(d){return h - yScale(d.h) - 10},
        'fill': 'SlateGray', //文字填滿為超漂亮灰色
        'text-anchor': 'middle',
        'font-size': '10px' //Fill、font-size也可以用CSS寫喔～
      });
    },
    render: function() {
      return <div className="graph">
             </div>;
    }
  });
}(window));
