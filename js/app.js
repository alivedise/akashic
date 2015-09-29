'use strict';

(function (exports) {
  exports.App = React.createClass({
    displayName: 'App',

    getInitialState: function getInitialState() {
      this.ref = new Firebase('https://gbf-user-database.firebaseio.com');
      this.guildRef = this.ref.child('guild');
      this.userRef = this.ref.child('user');
      this.guilds = [];
      this.searchingRefs = [];
      return {
        keyword: '',
        searching: false,
        results: []
      };
    },
    componentDidMount: function componentDidMount() {
      this.CHUNK_SIZE = 10;
      this.handleSnapshot = this.handleSnapshot.bind(this);
      window.addEventListener('hashchange', this);
      this.handleEvent();
    },
    handleEvent: function handleEvent() {
      this.clear();
      var hash = window.location.hash;
      var a = hash.split('/');
      console.log(a);
      if (a.length === 2) {
        switch (a[0]) {
          case '#gid':
            document.getElementById('keyword').value = 'gid/' + a[1];
            this.searchByGID(a[1]);
            break;
          case '#guild':
            document.getElementById('keyword').value = 'guild/' + a[1];
            this.searchByGuildName(a[1]);
            break;
          case '#user':
            document.getElementById('keyword').value = 'user/' + a[1];
            this.searchByUserName(a[1]);
            break;
          case '#search':
            document.getElementById('keyword').value = a[1];
            this.search(a[1]);
            break;
        }
      }
    },
    onKeydown: function onKeydown(evt) {
      var n = evt.nativeEvent;
      if (n.keyCode === 13) {
        this.onBlur();
      }
    },
    onBlur: function onBlur(evt) {
      var keyword = document.getElementById('keyword').value;
      var hash = '';
      if (keyword.match(/gid\/(.)*/)) {
        hash = '#' + keyword;
      } else if (keyword.match(/guild\/(.)*/)) {
        hash = '#' + keyword;
      } else if (keyword.match(/user\/(.)*/)) {
        hash = '#' + keyword;
      } else {
        hash = '#search/' + keyword;
      }
      window.location.hash = hash;
    },
    searchByGID: function searchByGID(keyword) {
      var ref = this.guildRef.child(keyword);
      ref.once('value', this.handleSnapshot);
      this.searchingRefs.push(ref);
    },
    searchByGuildName: function searchByGuildName(keyword) {
      var ref = this.guildRef.orderByChild('name').equalTo(keyword);
      ref.on('child_added', this.handleSnapshot);
      this.searchingRefs.push(ref);
    },
    searchByUserName: function searchByUserName(keyword) {
      var ref = this.userRef.orderByChild('name').equalTo(keyword);
      ref.once('value', this.handleSnapshot);
      this.searchingRefs.push(ref);
    },
    search: function search(keyword) {
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
    handleSnapshot: function handleSnapshot(snapshot) {
      console.log(snapshot.ref());
      var data = snapshot.val();
      if (!data) {
        this.setState({
          searching: false,
          results: this.store
        });
        return;
      }
      if (!data.members) {
        for (var k in data) {
          var ref = this.guildRef.child(data[k].gid);
          ref.once('value', this.handleSnapshot);
          this.searchingRefs.push(ref);
        }
      } else {
        this.store.push(data);
        this.setState({
          searching: false,
          results: this.store
        });
      }
    },
    clear: function clear() {
      this.searchingRefs && this.searchingRefs.forEach(function (ref) {
        ref.off('child_added', this.handleSnapshot);
        ref.off('value', this.handleSnapshot);
      }, this);
      this.setState({
        searching: true,
        results: []
      });
      this.store = [];
    },
    onClick: function onClick() {
      this.clear();
    },
    render: function render() {
      var dom = this.state.results.reverse().map(function (data) {
        if (data === null) {
          return React.createElement(
            'div',
            { className: 'alert alert-warning' },
            'No data'
          );
        }
        var type = '';
        if (data.members) {
          type = 'guild';
        } else {
          type = 'user';
        }
        return React.createElement(
          'div',
          { className: 'panel panel-primary', key: type + '/' + data.id },
          React.createElement(
            'div',
            { className: 'panel-heading' },
            data.id,
            '/',
            data.name,
            data.profile,
            React.createElement(
              'span',
              { className: 'badge' },
              data.rank
            ),
            React.createElement(
              'span',
              { className: 'badge' },
              '團員數：',
              data.members.length
            ),
            React.createElement(
              'span',
              { className: 'label label-info' },
              React.createElement(
                'a',
                { className: 'btn btn-link', href: "http://gbf.game.mbga.jp/#guild/detail/" + data.id },
                'Profile'
              )
            )
          ),
          React.createElement(
            'div',
            { className: 'panel-body' },
            React.createElement(Members, { gid: data.id, members: data.members })
          )
        );
      });

      var footer = '';
      if (this.state.results.length > 0) {
        footer = React.createElement(
          'div',
          { className: 'myfooter container' },
          React.createElement(
            'div',
            null,
            'Granblue Fantasy: Copyright@Cygames, Inc'
          ),
          React.createElement(
            'div',
            null,
            'Database powered by: ',
            React.createElement(
              'a',
              { className: 'btn btn-link', href: 'lhttp://github.com/alivedise' },
              'Alive'
            )
          )
        );
      } else if (this.state.searching) {
        dom = React.createElement(
          'div',
          { className: 'form-group' },
          React.createElement(
            'div',
            { className: 'col-md-12 text-center' },
            React.createElement('span', { className: 'glyphicon glyphicon-refresh glyphicon-refresh-animate' })
          )
        );
      } else {
        dom = React.createElement(
          'div',
          { className: 'alert alert-danger', role: 'alert' },
          'No data, please search again.'
        );
      }
      return React.createElement(
        'div',
        null,
        React.createElement(
          'div',
          { className: 'hero' },
          React.createElement(
            'div',
            { className: 'container' },
            React.createElement(
              'h1',
              null,
              'GranBlue Fantasy Database',
              React.createElement(
                'span',
                { className: 'label label-info' },
                '第14古戰'
              )
            ),
            React.createElement(
              'h2',
              null,
              '全空騎空團資料庫'
            ),
            React.createElement(
              'span',
              { className: 'label label-success' },
              '245227+ guilds'
            ),
            React.createElement(
              'span',
              { className: 'label label-warning' },
              '563745+ guild members'
            ),
            React.createElement('input', { type: 'text', className: 'form-control', placeholder: 'Enter full name or gid', onBlur: this.onBlur, onKeyDown: this.onKeydown, id: 'keyword' })
          )
        ),
        React.createElement(
          'div',
          { id: 'results' },
          React.createElement(
            'div',
            { className: 'container' },
            React.createElement(
              'div',
              { className: 'list-group' },
              dom
            )
          )
        ),
        footer
      );
    }
  });
})(window);