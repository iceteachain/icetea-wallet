import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import * as actions from '../../../store/actions/create';
import { Button, MnemonicItem } from '../../elements';
import { Header2, DivControlBtn, DivPreviousBt, Icon, DivSelectWordBase } from '../../elements/utils';

const DivH3 = styled.div`
  text-align: left;
  font-size: 16px;
  display: flex;
  font-weight: 500;
  i {
    margin-right: 15px;
  }
`;
const DivRecoverWord = styled.div`
  background: #f9f9f9;
  border: 1px dashed #d8d8d8;
  border-color: ${props => (props.isValid ? 'rgba(223,226,231)' : '#F23051')};
  padding: 10px;
  position: relative;
  min-height: 100px;
  overflow: hidden;
`;
const TryAgain = styled.div`
  font-size: 12px;
  color: #f23051;
  line-height: 13px;
`;
const DivSelectWord = styled(DivSelectWordBase)`
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-top: ${props => (props.isValid ? '20px' : '6px')};
  margin-left: -5px;
`;
class NewWallet04 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedWords: [],
      shuffledWords: [],
      isSequenceCorrect: true,
    };
  }

  componentDidMount() {
    document.scrollingElement.scrollTop = 1e3;
    const items = this._getRandomSequenceMenmonic();
    this.setState({
      shuffledWords: items,
    });
  }

  _goback = () => {
    const { props } = this;
    props.setStep('backupMnemonic');
  };

  _shuffle = mnemonic => {
    for (let i = mnemonic.length; i > 0; ) {
      const ran = Math.floor(Math.random() * i);

      const item = mnemonic[--i];
      mnemonic[i] = mnemonic[ran];
      mnemonic[ran] = item;
    }
    return mnemonic;
  };

  _getRandomSequenceMenmonic = () => {
    const { props } = this;
    const mnemonic = props.mnemonic.split(' ');
    return this._shuffle(mnemonic);
  };

  _selectWord = e => {
    const { selectedWords, shuffledWords } = this.state;
    selectedWords.push(e);
    for (let i = 0, len = shuffledWords.length; i < len; i++) {
      if (shuffledWords[i] === e) {
        shuffledWords.splice(i, 1);
        break;
      }
    }
    this.forceUpdate();
    this._compareSequence();
  };

  _compareSequence = () => {
    const { props, state } = this;
    const selectItem = state.selectedWords;

    const mnemonic = props.mnemonic.split(' ');
    this.setState({
      isSequenceCorrect: _.isEqual(mnemonic.slice(0, selectItem.length), selectItem),
    });
  };

  _recoverWord = e => {
    const { selectedWords, shuffledWords } = this.state;
    shuffledWords.push(e);
    for (let i = 0, len = selectedWords.length; i < len; i++) {
      if (selectedWords[i] === e) {
        selectedWords.splice(i, 1);
        break;
      }
    }
    this.forceUpdate();
    this._compareSequence();
  };

  _continue = () => {
    const { props } = this;
    props.setStep('success');
  };

  render() {
    const { shuffledWords, selectedWords, isSequenceCorrect } = this.state;
    return (
      <div>
        <Header2>
          <span className="page">2</span>
          <span className="totalPage">/2</span>
          <span className="title">Choose Secondary Access</span>
        </Header2>
        <DivH3>
          <span>Please select the Mnemonic Phrase in the correct order to ensure that your copy is correct.</span>
        </DivH3>
        <DivRecoverWord isValid={isSequenceCorrect}>
          {selectedWords.map((items, index) => {
            return <MnemonicItem key={index} value={items} canClose onClick={() => this._recoverWord(items)} />;
          })}
        </DivRecoverWord>
        {!isSequenceCorrect && <TryAgain>Incorrect Mnemonic Phrase order. Please try again.</TryAgain>}
        <DivSelectWord isValid={isSequenceCorrect}>
          {shuffledWords.map((items, index) => {
            return <MnemonicItem key={index} value={items} onClick={() => this._selectWord(items)} />;
          })}
        </DivSelectWord>
        <DivControlBtn>
          <DivPreviousBt className="previous-button">
            <Icon type="back" size="20" color="inherit" />
            <div className="unlock" onClick={this._goback}>
              Previous
            </div>
          </DivPreviousBt>
          <Button disabled={!isSequenceCorrect || shuffledWords.length !== 0} width="120px" onClick={this._continue}>
            <React.Fragment>
              <span style={{ marginRight: '10px' }}>Continue</span>
              <Icon type="continue" size="20" color="inherit" />
            </React.Fragment>
          </Button>
        </DivControlBtn>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    mnemonic: state.create.mnemonic,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setStep: step => {
      dispatch(actions.setStep(step));
    },
  };
};

NewWallet04.defaultProps = {
  mnemonic: '',
  setStep() {},
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(NewWallet04));
