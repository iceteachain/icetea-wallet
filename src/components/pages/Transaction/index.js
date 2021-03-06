import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import GroupCalendar from './GroupCalendar';
import PuDetailTx from '../../elements/pu';
import Table from '../../elements/TablePro';
import * as actions from '../../../store/actions/transaction';
import { iteaScanAddress } from '../../../config/networks';
// import TxHash from './TxHash';

import {
  Wrapper,
  Content,
  Title,
  WrapperHeader,
  WrapperTextFullHistory,
  ColorGray,
  StyledText,
  IconInOut,
  TypeTranfer,
  TypeOrder,
} from './styled';

import { TxHash, FontDin, Icon } from '../../elements/utils';

const txType = {
  TRANSFER: 'Transfer',
  VOTE: 'Vote',
  DEPOSIT: 'Deposit',
  DEPLOY: 'Deploy',
  CALL: 'Call',
};

class index extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      detail: null,
      current: 1,
      pageSize: 10,
      addr: '',
      balance: 0,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { address, balance } = nextProps;
    let value = {};
    if (address !== prevState.addr) value = Object.assign({}, { addr: address });
    if (balance !== prevState.balance) value = Object.assign({}, { balance });
    if (value) return value;
    return null;
  }

  componentDidMount() {
    this.getHistory();
  }

  componentDidUpdate(prevProps, prevState) {
    const { addr, balance } = this.state;
    addr !== prevState.addr || (balance !== prevState.balance && this.getHistory());
  }

  getHistory = () => {
    const { address, getTxHistory } = this.props;
    const { addr } = this.state;

    const params = {
      address: addr || address,
      conditions: '',
      options: { prove: false, page: 1, per_page: 100 },
    };
    getTxHistory(params);
  };

  convertText = e => {
    switch (e) {
      case 'TRANSFER':
        return {
          text: txType[e],
          color: 'rgb(0, 192, 135)',
        };
      case 'CALL':
        return {
          text: txType[e],
          color: '#848e9c',
        };
      case 'DEPLOY':
      default:
        return {
          text: txType[e],
          color: 'rgb(74, 144, 226)',
        };
    }
  };

  buildColumns = () => {
    const { address } = this.props;
    return [
      {
        title: 'TxHash',
        headerAlign: 'left',
        sorter: true,
        dataIndex: 'txHash',
        key: 'TxHash',
        render: e => <TxHash hash={e.txHash} />,
      },
      {
        title: 'Date',
        dataIndex: 'date',
        headerAlign: 'left',
        sorter: true,
        key: 'Date',
        render: e => (
          <ColorGray>
            <FontDin value={e.date} />
          </ColorGray>
        ), // format("MM-DD h:mm:ss")
      },
      // {
      //   title: 'exchange.pair',
      //   dataIndex: 'pair',
      //   key: 'Asset',
      //   render: (e) => <ColorGray>pair</ColorGray>
      // },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'Type',
        render: e => {
          const typeTx = this.convertText(e.type);
          let type = '';
          if (e.fromAddr === e.toAddr && e.fromAddr === address) {
            type = '-';
          } else if (e.fromAddr === address) {
            type = 'OUT';
          } else {
            type = 'IN';
          }

          return (
            <StyledText style={{ minWidth: '100px' }}>
              <IconInOut color={typeTx.color} />
              <span>{typeTx.text}</span>
              {e.type === 'TRANSFER' && <TypeTranfer type={type}>{type}</TypeTranfer>}
              {(e.type === 'CALL' || e.type === 'DEPLOY') && (
                <TypeOrder type={e.side.toUpperCase()}>{e.side.toUpperCase()}</TypeOrder>
              )}
            </StyledText>
          );
        },
      },
      {
        title: 'Value',
        dataIndex: 'value',
        key: 'Value',
        render: e => (
          <StyledText>
            <FontDin value={e.value} />
          </StyledText>
        ), // Object(z.d)(e.value, 4)
      },
      {
        title: 'Gas Limit',
        dataIndex: 'txFee',
        key: 'TxFee',
        render: e => (
          <StyledText>
            <FontDin value={e.txFee} />
          </StyledText>
        ),
      },
      {
        title: '',
        dataIndex: 'op',
        key: '',
        render: e => (
          <div onClick={() => this.showDetail(e)} role="presentation">
            <Icon type="detail-D" color="#848E9C" hoverColor="#15b5dd" />
          </div>
        ),
      },
    ];
  };

  showDetail = e => {
    this.setState({
      detail: e,
    });
  };

  clearDetail = () => {
    this.setState({
      detail: null,
    });
  };

  buildDataSource = () => {
    const { current, pageSize } = this.state;
    let { transactionHistory } = this.props;

    const total = transactionHistory.length;
    const from = (current - 1) * pageSize;
    let to = from + pageSize;

    if (total > 0) {
      if (to > total) to = total;
      // console.log('from: ', from,'-to',to)
      transactionHistory = transactionHistory.slice(from, to);
    }
    const dataSource = transactionHistory.map(e => {
      const t = e.data || {}; // && JSON.parse(e.data) || {};
      return {
        date: e.time,
        // pair: t.orderData ? t.orderData.symbol : e.txAsset,
        type: e.txType,
        side: t.orderData ? t.orderData.side : '-',
        value: e.value || 0, // (t.orderData ? t.orderData.quantity : e.value), // Object(z.g)
        txFee: e.fee || 0, // (e.fee), // Object(z.g)
        txHash: e.hash,
        op: '',
        blockHeight: e.blockHeight,
        fromAddr: e.from,
        toAddr: e.to || '',
      };
    });
    return dataSource;
  };

  filter = e => {
    // const filterParams = {};
    // const g = '';
    if (e.manualStartDate || e.manualEndDate) {
      // e.manualStartDate && (filterParams.startTime = e.manualStartDate.getTime());
      // e.manualEndDate && (filterParams.endTime = e.manualEndDate.getTime());
      // filterParams.startTime === filterParams.endTime &&
      //   (filterParams.endTime = new Date(''.concat(g()(e.manualEndDate).format('YYYY/MM/DD'), ' 23:59:59')).getTime());
      // this.setState(
      //   {
      //     filterParams,
      //   },
      //   () => {
      //     this.getHistory(filterParams);
      //   }
      // );
    } else {
      alert('exchange.pleaseSelectDate');
    }
  };

  paging = (current, pageSize) => {
    if (pageSize) {
      this.setState({
        current,
        pageSize,
      });
    } else {
      this.setState({
        current,
      });
    }
  };

  render() {
    const { total, address, isFetching } = this.props;
    const { detail, pageSize, current } = this.state;
    return (
      <Wrapper>
        <Content>
          <Title>Transaction History</Title>
          <WrapperHeader>
            <GroupCalendar hasType={false} hasPair={false} onFilterChange={this.filter} defaultDate={new Date()} />
            <WrapperTextFullHistory>
              Not every transaction is included below. For full history, please refer to
              <a href={iteaScanAddress.replace('{address}', address)} target="_blank" rel="noopener noreferrer">
                here
              </a>
              .
            </WrapperTextFullHistory>
          </WrapperHeader>
          {isFetching && <div>Loading</div>}
          <Table
            columns={this.buildColumns()}
            dataSource={this.buildDataSource()}
            paging={this.paging}
            total={total}
            current={current}
            pageSize={pageSize}
          />
          {detail && <PuDetailTx detail={detail} close={this.clearDetail} />}
        </Content>
      </Wrapper>
    );
  }
}
index.defaultProps = {
  transactionHistory: [],
  total: 0,
  address: '',
  dispatch() {},
};

const mapStateToProps = state => {
  const { address, balance } = state.account;
  const { transactionHistory } = state.transaction;
  return {
    transactionHistory: transactionHistory.tx,
    total: transactionHistory.total,
    address,
    balance,
    isFetching: state.transaction.isFetching,
  };
};

const mapDispatchToProps = dispatch => ({
  getTxHistory: data => {
    dispatch(actions.getTxHistory(data));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(index));
