'use strict';

(function (exports) {
  exports.Members = React.createClass({
    displayName: 'Members',

    getInitialProps: function getInitialProps() {
      return {
        gid: '',
        members: [],
        ref: null
      };
    },
    getInitialState: function getInitialState() {
      return {
        users: []
      };
    },
    componentDidMount: function componentDidMount() {
      this.handleSnapshot = this.handleSnapshot.bind(this);
      this.onClick();
    },
    handleSnapshot: function handleSnapshot(snapshot) {
      var user = snapshot.val();
      console.log(JSON.stringify(user));
      this.setState(function (previousState) {
        previousState.users.push(user);
        return {
          users: previousState.users
        };
      });
    },
    componentWillUnmount: function componentWillUnmount() {
      this.fetchingRef && this.fetchingRef.forEach(function (ref) {
        ref.off('child_added', this.handleSnapshot);
      }, this);;
    },
    onClick: function onClick() {
      if (!this.fetchingRef) {
        console.log('fetching memebers', this.props.gid, this.props.members);
        var ref = new Firebase('https://gbf-user-database.firebaseio.com');
        var userRef = ref.child('user');
        this.fetchingRefs = this.props.members.map(function (uid) {
          return userRef.child(String(uid)).on('value', this.handleSnapshot);
        }, this);
      }
    },
    render: function render() {
      var dom = this.state.users.map(function (data) {
        return React.createElement(
          'div',
          { className: 'list-group-item pc-item', key: 'user' + data.id, style: { "background-image": 'url(' + data.summon + ')' } },
          React.createElement('img', { className: 'pc', src: data.pc }),
          React.createElement(
            'span',
            { className: 'label label-info label-sm' },
            data.rank
          ),
          React.createElement(
            'span',
            null,
            data.name,
            '(UID: ',
            data.id,
            ')'
          ),
          React.createElement(
            'a',
            { className: 'btn btn-link', href: "http://gbf.game.mbga.jp/#profile/" + data.id },
            'Profile'
          )
        );
      }, this);
      var graph = '';
      console.log(this.state.users.length, this.props.members.length);
      if (this.state.users.length > 0 && this.state.users.length === this.props.members.length) {
        console.log('all data got');
        graph = React.createElement(LevelGraph, { members: this.state.users });
      }
      return React.createElement(
        'div',
        { className: 'list-group' },
        graph,
        dom
      );
    }
  });
})(window);