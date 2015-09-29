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
    componentDidMount: function() {
      this.handleSnapshot = this.handleSnapshot.bind(this);
      this.onClick();
    },
    handleSnapshot: function(snapshot) {
      var user = snapshot.val();
      console.log(JSON.stringify(user));
      this.setState(function(previousState) {
        previousState.users.push(user);
        return {
          users: previousState.users
        }
      });
    },
    componentWillUnmount: function() {
      this.fetchingRef && this.fetchingRef.forEach(function(ref) { ref.off('child_added', this.handleSnapshot) }, this);;
    },
    onClick: function() {
      if (!this.fetchingRef) {
        console.log('fetching memebers', this.props.gid, this.props.members);
        var ref = new Firebase('https://gbf-user-database.firebaseio.com');
        var userRef = ref.child('user');
        this.fetchingRefs = this.props.members.map(function(uid) {
          return userRef.child(String(uid)).on('value',
            this.handleSnapshot);
        }, this);
      }
    },
    render: function() {
      var dom = this.state.users.map(function(data) {
        return <div className="list-group-item pc-item" key={'user' + data.id} style={{"background-image": 'url(' + data.summon + ')'}}>
                <img className="pc" src={data.pc}></img>
                <span className="label label-info label-sm">{data.rank}</span>
                <span>{data.name}(UID: {data.id})</span>
                <a className="btn btn-link" href={"http://gbf.game.mbga.jp/#profile/" + data.id}>Profile</a>
              </div>
      }, this);
      var graph = '';
      console.log(this.state.users.length, this.props.members.length);
      if (this.state.users.length > 0 &&
          this.state.users.length === this.props.members.length) {
        console.log('all data got');
        graph = <LevelGraph members={this.state.users} />;
      }
      return <div className="list-group">
              {graph}
              {dom}
             </div>
    }
  });
}(window));
