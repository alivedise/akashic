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
    onClick: function onClick() {
      if (!this.fetching) {
        this.fetching = true;
        this.ref = new Firebase('https://gbf-user-database.firebaseio.com');
        this.userRef = this.ref.child('user');
        this.userRef.orderByChild('gid').equalTo(+this.props.gid).on('child_added', (function (snapshot) {
          this.setState((function (previousState) {
            previousState.push(snapshot.val());
            return {
              users: previousState
            };
          }).bind(this));
        }).bind(this));
      }
    },
    render: function render() {
      var dom = this.state.users.map(function (data) {
        return React.createElement(
          'div',
          { key: 'user' + data.id },
          data.id,
          ', ',
          data.rank,
          ', ',
          data.login
        );
      }, this);
      return React.createElement(
        'div',
        null,
        React.createElement(
          'button',
          { onClick: this.onClick },
          'fetch'
        ),
        dom
      );
    }
  });
})(window);