import React from 'react';
import JoinTeamForm from './JoinTeamForm.jsx';

export default class JoinTeam extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      joinTeamError: null,
      invitations: []
    };
  }

  async componentDidMount() {

    let me;
    try {
      me = await this.api.getMe();
    } catch (err) {
      this.onUserNotLoggedIn(err);
    }

    try {
      let invitations = await this.props.api.getAllInvitations();
      invitations = invitations.filter(invitation => invitation.team.members.length >= 1);
      this.setState({
        invitations: invitations
      });
    } catch (err) {
      this.onLoadingInvitationsError(err);
    }
  }

  onUserNotLoggedIn(err) {
    // TODO: Redirect;
  }

  onLoadingInvitationsError(err) {
    // TODO: Handle error
  }

  onSubmit(data) {
    const selectedTeamId = data.formData.selectedTeam;
    this.props.api.joinTeam(selectedTeamId)
      .then(this.onJoinSuccess.bind(this))
      .catch(this.onJoinError.bind(this));
  }

  onJoinSuccess(data) {
    console.log("Success!");
  }

  onJoinError(error) {
    const message = this.parseError(error);
    this.setState({
      joinTeamError: message
    });
  }

  parseError(error) {
    try {
      const message = error.response.data.message;
      return message;
    } catch (err) {
      return error.message;
    }
  }


  render() {
    return (
      <JoinTeamForm i18next={this.props.i18next}
                    onSubmit={this.onSubmit.bind(this)}
                    teamCreationError={this.state.joinTeamError}
                    invitations={this.state.invitations}
                    joinTeamError={this.state.joinTeamError}
                    onError={() => {
                    }}
                    onChange={() => {
                    }}/>
    );
  }
}