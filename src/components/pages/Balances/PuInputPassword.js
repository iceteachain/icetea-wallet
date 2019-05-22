import React, { PureComponent } from 'react';
import QueueAnim from 'rc-queue-anim';
import { zIndex } from '../../../constants/styles';
import styled from 'styled-components';
import { Button, InputPassword } from '../../elements';
import { Icon } from '../../elements/utils';
import error from './../../../assets/img/error-icon.svg';
import { utils } from '../../../utils';
import { connect } from 'react-redux';
import * as actions from '../../../store/actions/account';

const WrapperPu = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${zIndex.modal};
  background: rgba(0, 0, 0, 0.5);
`;

const OutBoxPu = styled.div`
  min-width: 320px;
  max-width: 450px;
  padding: 30px;
  box-sizing: border-box;
  background: ${props => props.theme.popupBg};
  box-shadow: ${props => props.theme.boxShadow};
  border-radius: 3px;
  position: fixed;
  top: 25%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const PuTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: ${props => props.theme.fontColor};
`;

const WrapperInput = styled.div`
  padding: 20px 0;
  font-size: 16px;
  margin: 20px 0 30px 0;
  width: 400px;
  @media (min-width: 320px) and (max-width: 623px) {
    width: 280px;
  }
`;

const WrapperBtn = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  a {
    color: #f0b90b;
    font-size: 14px;
  }
`;

const WrapperPassErr = styled.div`
  color: #f23051;
  position: absolute;
  bottom: 80px;
  left: 25px;
  right: 0;
  font-size: 14px;
  display: flex;
  height: 20px;
  align-items: center;
  img {
    width: 15px;
    margin-right: 5px;
  }
`;

const WrapperBtnClose = styled.div`
  position: absolute;
  top: 5px;
  right: 8px;
  cursor: pointer;
  line-height: 20px;
  color: ${props => props.theme.fontColor};
  &:hover {
    color: #f0b90b;
  }
`;

class PuInputPassword extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      errMsg: '',
      loading: false,
    };
  }

  componentDidMount = () => {
    window.document.body.addEventListener('keydown', this._keydown);
  };
  componentWillUnmount = () => {
    clearTimeout(this.timeoutHanle1);
    clearTimeout(this.timeoutHanle2);
    window.document.body.removeEventListener('keydown', this._keydown);
  };

  _passwordChange = e => {
    this.setState({
      password: e,
    });
  };

  // close = () => {
  //   const e = this.props;
  //   (0, e.dispatch)((0, e.setNeedAuth)(false));
  // };

  _confirm = () => {
    document.activeElement.blur();
    const setAccount = this.props.setAccount;
    let userInfo = sessionStorage.getItem('user');
    if ((userInfo = (userInfo && JSON.parse(userInfo)) || {}).address && userInfo.privateKey) {
      const pass = this.state.password;
      let triggerElement = this.props.triggerElement;
      if (!pass) {
        return void this.setState({
          errMsg: 'password should not be null',
        });
      }
      this.setState({
        loading: !0,
      });
      this.timeoutHanle1 = setTimeout(() => {
        try {
          const privateKey = utils.recoverAccountFromPrivateKey(userInfo.privateKey, pass, userInfo.address);
          const address = utils.getAddressFromPrivateKey(privateKey);
          console.log('CK input address', userInfo.address);

          setAccount({
            privateKey: privateKey,
            cipher: pass,
            flags: userInfo.flags,
            address: address
          });

          this.timeoutHanle2 = setTimeout(() => {
            this.setState({
              loading: false,
            });
            triggerElement && triggerElement.click();
            this.props.close();
          }, 800);
        } catch (log) {
          console.log('Wrong Password!', log);
          this.setState({
            errMsg: 'Wrong Password!',
            loading: false,
          });
        }
      }, 100);
    }
    this.props.onCFSuccess();
  };

  _keydown = e => {
    if (e.keyCode === 13) this._confirm();
  };

  render() {
    const { needAuth, close } = this.props;
    const { errMsg, loading } = this.state;
    return needAuth ? (
      <QueueAnim animConfig={{ opacity: [1, 0] }}>
        <WrapperPu key={1}>
          <QueueAnim leaveReverse delay={100} type={['top', 'bottom']}>
            <OutBoxPu key={2}>
              <PuTitle>Password</PuTitle>
              <WrapperInput>
                <InputPassword
                  withRules={false}
                  autoFocus={true}
                  onChange={this._passwordChange}
                  title="Enter your session password"
                />
              </WrapperInput>
              <WrapperBtn>
                <Button onClick={this._confirm} loading={loading} width="100px" type="submit">
                  <span>Confirm</span>
                </Button>
              </WrapperBtn>
              {errMsg && (
                <WrapperPassErr>
                  <img src={error} />
                  <span>{errMsg}</span>
                </WrapperPassErr>
              )}
              <WrapperBtnClose onClick={close}>
                <Icon type="close" size="18" />
              </WrapperBtnClose>
            </OutBoxPu>
          </QueueAnim>
        </WrapperPu>
      </QueueAnim>
    ) : null;
  }
}

const mapStateToProps = state => {
  const { account } = state;
  return {
    privateKey: account.privateKey,
    cipher: account.cipher,
    flags: account.flags,
    address: account.address
  };
};

PuInputPassword.defaultProps = {
  needAuth: true,
  setAccount: function() {},
  setNeedAuth: function() {},
  dispatch: function() {},
  triggerElement: null,
  close: function() {},
};

const mapDispatchToProps = dispatch => {
  return {
    setAccount: data => {
      dispatch(actions.setAccount(data));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PuInputPassword);