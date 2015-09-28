'use strict';

(function (exports) {
  exports.App = React.createClass({
    displayName: 'App',

    getInitialState: function getInitialState() {
      this.ref = new Firebase('https://gbf-user-database.firebaseio.com');
      this.guildRef = this.ref.child('guild');
      this.userRef = this.ref.child('user');
      this.guilds = [];
      return {
        search: '',
        results: []
      };
    },
    componentDidMount: function componentDidMount() {
      this.handleSnapshot = this.handleSnapshot.bind(this);
    },
    onChange: function onChange(evt) {
      console.log(document.getElementById('keyword').value);
      var keyword = document.getElementById('keyword').value;
      this.setState({
        results: []
      });
      this.currentRef && this.currentRef.off('child_added', this.handleSnapshot);
      this.currentRef = this.guildRef.orderByChild('name').equalTo(keyword);
      this.currentRef.on('child_added', this.handleSnapshot);
    },
    handleSnapshot: function handleSnapshot(snapshot) {
      var guild = snapshot.val();
      this.setState(function (previousState) {
        previousState.results.push(guild);
        return {
          results: previousState
        };
      });
    },
    render: function render() {
      var dom = this.state.results.reverse().map(function (data) {
        var type = '';
        if (data.members) {
          type = 'guild';
        } else {
          type = 'user';
        }
        return React.createElement(
          'div',
          { key: type + '/' + data.id },
          React.createElement(
            'div',
            null,
            data.id,
            ', ',
            data.name,
            ', ',
            data.rank,
            ', ',
            data.profile
          ),
          React.createElement(Members, { gid: data.id, members: data.members })
        );
      });
      return React.createElement(
        'div',
        null,
        React.createElement('input', { type: 'text', onChange: this.onChange, id: 'keyword' }),
        dom
      );
    }
  });
})(window);