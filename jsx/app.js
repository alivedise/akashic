'use strict';

(function(exports) {
  exports.App = React.createClass({
    getInitialState: function() {
      this.ref = new Firebase('https://gbf-user-database.firebaseio.com');
      this.guildRef = this.ref.child('guild');
      this.userRef = this.ref.child('user');
      this.guilds = [];
      this.searchingRefs = [];
      return {
        keyword: '',
        searching: false,
        results: []
      }
    },
    componentDidMount: function() {
      this.CHUNK_SIZE = 10;
      this.handleSnapshot = this.handleSnapshot.bind(this);
      window.addEventListener('hashchange', this);
      this.handleEvent();
    },
    handleEvent: function() {
      this.clear();
      var hash = window.location.hash;
      var a = hash.split('/');
      if (a.length === 2) {
        switch (a[0]) {
          case '#gid':
            document.getElementById('keyword').value = 'gid/' + a[1];
            this.searchByGID(a[1]);
            break;
          case '#guild':
            document.getElementById('keyword').value = 'guild/' + a[1];
            this.searchByGuildName(a[1])
            break;
          case '#user':
            document.getElementById('keyword').value = 'user/' + a[1];
            this.searchByUserName(a[1]);
            break;
          case '#uid':
            document.getElementById('keyword').value = 'uid/' + a[1];
            this.searchByUID(a[1]);
            break;
          case '#search':
            document.getElementById('keyword').value = a[1];
            this.search(a[1]);
            break
        }
      }
    },
    onKeydown: function(evt) {
      var n = evt.nativeEvent;
      if (n.keyCode === 13) {
        this.onBlur();
      }
    },
    onBlur: function(evt) {
      var keyword = document.getElementById('keyword').value;
      var hash = '';
      if (keyword.match(/gid\/(.)*/)) {
        hash = '#' + keyword;
      } else if (keyword.match(/guild\/(.)*/)) {
        hash = '#' + keyword;
      } else if (keyword.match(/uid\/(.)*/)) {
        hash = '#' + keyword;
      } else if (keyword.match(/user\/(.)*/)) {
        hash = '#' + keyword;
      } else {
        hash = '#search/' + keyword;
      }
      window.location.hash = hash;
    },
    searchByGID: function(keyword) {

      this.setState({
        searching: true
      });
      var ref = this.guildRef.child(keyword);
      ref.once('value', this.handleSnapshot);
      this.searchingRefs.push(ref);
    },

    searchByUID: function(keyword) {
      this.setState({
        searching: true
      });
      var ref = this.userRef.child(keyword);
      ref.once('value', this.handleSnapshot);
      this.searchingRefs.push(ref);
    },
    searchByGuildName: function(keyword) {

      this.setState({
        searching: true
      });
      var ref = this.guildRef.orderByChild('name').equalTo(keyword);
      ref.on('child_added', this.handleSnapshot);
      this.searchingRefs.push(ref);
    },
    searchByUserName: function(keyword) {

      this.setState({
        searching: true
      });
      var ref = this.userRef.orderByChild('name').equalTo(keyword);
      ref.once('value', this.handleSnapshot);
      this.searchingRefs.push(ref);
    },
    search: function(keyword) {
      this.clear();
      if (keyword === '') {
        return;
      }
      if (!isNaN(keyword)) {
        this.searchByGID(keyword);
      } else {
        this.searchByGuildName(keyword);
      }
    },
    handleSnapshot: function(snapshot) {
      var data = snapshot.val();
      if (!data) {
        this.setState({
          searching: false,
          results: this.store
        });
        return;
      }
      if (!data.members) {
        console.log(data);
        if (data.gid) {
          var ref = this.guildRef.child(data.gid);
          ref.once('value', this.handleSnapshot);
          this.searchingRefs.push(ref);
        } else {
          for (var k in data) {
            var ref = this.guildRef.child(data[k].gid);
            ref.once('value', this.handleSnapshot);
            this.searchingRefs.push(ref);
          }
        }
      } else { 
        this.store.push(data);
        this.setState({
          searching: false,
          results: this.store
        });
      }
    },
    clear: function() {
      this.searchingRefs && this.searchingRefs.forEach(function(ref) {
        ref.off('child_added', this.handleSnapshot);
        ref.off('value', this.handleSnapshot);
      }, this);
      this.setState({
        searching: false,
        results: []
      });
      this.store = [];
    },
    onClick: function() {
      this.clear();
    },
    render: function() {
      var dom = this.state.results.reverse().map(function(data) {
        if (data === null) {
          return <div className="alert alert-warning">No data</div>;
        }
        var type = '';
        if (data.members) {
          type = 'guild';
        } else {
          type = 'user';
        }
        return <div className="panel panel-primary" key={type + '/' + data.id}>
                <div className="panel-heading">
                  {data.id}/{data.name}{data.profile}
                  <span className="badge">{data.rank}</span>
                  <span className="badge">團員數：{data.members.length}</span>
                  <span className="label label-info"><a className="btn btn-link" href={"http://gbf.game.mbga.jp/#guild/detail/" + data.id}>Profile</a></span>
                </div>
                <div className="panel-body">
                  <Members gid={data.id} members={data.members} />
                </div>
               </div>
      });

      var footer = '';
      if (this.state.results.length > 0) {
        footer = <div className="myfooter panel-footer">
                  <div className="well well-sm">
                    Granblue Fantasy: Copyright@Cygames, Inc<br/>
                    Database powered by: <a className="btn btn-link" href="lhttp://github.com/alivedise" >Alive</a>
                  </div>
                </div>
      } else if (this.state.searching) {
        dom = <div className="form-group">
                    <div className="col-md-12 text-center">
                      <span className="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>
                    </div>
                  </div>;
      } else if (window.location.hash) {
        dom = <div className="alert alert-danger" role="alert">No data, please search again.</div>
      }
      return <div>
              <div className="hero">
                <div className="container">
                  <h1>GranBlue Fantasy Database<span className="label label-info">第14古戰</span></h1>
                  <h2>全空騎空團資料庫</h2>
                  <span className="label label-success">245227+ guilds</span>
                  <span className="label label-warning">563745+ guild members</span>
                  <input type="text" className="form-control" placeholder="Enter full name or gid" onBlur={this.onBlur} onKeyDown={this.onKeydown} id="keyword" />
                </div>
              </div>
              <div id="results">
                <div className="container">
                  <div className="list-group">
                    {dom}
                  </div>
                </div>
              </div>
              {footer}
             </div>
    }
  });
}(window));
