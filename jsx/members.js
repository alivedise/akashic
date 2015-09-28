'use strict';

(function(exports) {
  exports.Members = React.createClass({
    getInitialProps: function() {
      return {
        gid: '',
        members: [],
        ref: null
      }
    },
    getInitialState: function() {
      return {
        users: []
      }
    },
    onClick: function() {
      if (!this.fetching) {
        this.fetching = true;
        this.ref = new Firebase('https://gbf-user-database.firebaseio.com');
        this.userRef = this.ref.child('user');
        this.userRef.orderByChild('gid').equalTo(+this.props.gid).on('child_added', function(snapshot) {
          this.setState(function(previousState) {
            previousState.push(snapshot.val());
            return {
              users: previousState
            }
          }.bind(this));
        }.bind(this));
      }
    },
    render: function() {
      var dom = this.state.users.map(function(data) {
        return <div key={'user' + data.id}>{data.id}, {data.rank}, {data.login}</div>
      }, this);
      return <div><button onClick={this.onClick}>fetch</button>{dom}</div>
    }
  });
}(window));
