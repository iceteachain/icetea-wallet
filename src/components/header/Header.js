import React, { PureComponent } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';

import logoHeader from '../../assets/img/headerLogo.svg';
import { Icon, checkDevice } from '../elements/utils';
import { mainnet, testnet, currentServer, explorer, faq, forums } from '../../config/networks';

import ManageAccounts from './ManageAccounts';
import MenuMobile from '../menu/MenuMobile';
import Clock from './Clock';
import {
  WrapperHeader,
  LogoDisplay,
  LogoWrapper,
  OclockWrapper,
  MenuDisplay,
  StyledUlTag,
  StyledIconMobileMenu,
  ItemsSubMenuWapper,
} from './HeaderStyled';

const authenticated = [
  {
    text: 'Balances',
    path: '/balances',
    selected: true,
  },
  {
    text: 'Transactions',
    path: '/transactionHistory',
    selected: false,
  },
  {
    text: 'Bot Store',
    path: '/botStore',
    selected: false,
  },
  {
    text: 'Profile',
    path: '/profile',
    selected: false,
  },
];

const unauthenticated = [
  {
    text: 'Create New Wallet',
    path: '/create',
  },
  {
    text: 'Unlock Wallet',
    path: '/unlock',
  },
];

function setSelectedMenuItem() {
  let path = window.location.pathname;
  path = path.replace(/\/$/, '');
  path = decodeURIComponent(path);
  authenticated.forEach(item => {
    if (item.path === path) {
      item.selected = true;
    } else {
      item.selected = false;
    }
  });
  return true;
}

class Header extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showMobileMenu: false,
      selectMenuItems: setSelectedMenuItem() && props.address ? authenticated : unauthenticated,
      // showSearchIcon: false,
    };
  }

  // _getMenus = () => {
  //   const { address } = this.props;
  //   return address ? authenticated : unauthenticated;
  // };

  _showMobileMenu = () => {
    this.setState({
      showMobileMenu: true,
    });
  };

  _hideMobileMenu = () => {
    this.setState({
      showMobileMenu: false,
    });
  };

  _clickLogo = () => {
    const { history } = this.props;
    history.push('/');
  };

  _buildSubMenus = subMenus => {
    return subMenus.map(sub => {
      return (
        <li key={sub.text}>
          <Link to={sub.path}>{sub.text}</Link>
        </li>
      );
    });
  };

  _menuSelect = item => {
    const { selectMenuItems } = this.state;

    selectMenuItems.forEach(el => {
      if (el.text === item.text) {
        el.selected = true;
      } else {
        el.selected = false;
      }
    });
  };

  render() {
    const { showMobileMenu, selectMenuItems } = this.state;
    const { className, bgColor, address, needAuth } = this.props;
    // console.log('render header');

    const MenuItems = selectMenuItems.map(el => {
      // console.log('Menus', el);
      return el.subMenus ? (
        <li className="withSubMenus" key={el.text}>
          <span>{el.text}</span>
          <ItemsSubMenuWapper className="subMenus">{this._buildSubMenus(el.subMenus)}</ItemsSubMenuWapper>
          <i className="triangle" />
        </li>
      ) : (
        <li onClick={() => this._menuSelect(el)} className={el.selected ? 'menu-item-selected' : ''} key={el.text}>
          <Link to={el.path}>
            <span>{el.text}</span>
          </Link>
        </li>
      );
    });

    return (
      <WrapperHeader className={className} bgColor={bgColor} needAuth={needAuth}>
        <LogoDisplay>
          <LogoWrapper onClick={this._clickLogo}>
            <img src={logoHeader} alt="" />
          </LogoWrapper>
          {/* mobile.. */}
        </LogoDisplay>
        {!checkDevice.isMobile() && (
          <OclockWrapper>
            <Clock />
          </OclockWrapper>
        )}
        <MenuDisplay>
          <StyledUlTag>{MenuItems}</StyledUlTag>
          {address && <ManageAccounts address={address} />}
          <StyledUlTag>
            <li className="withSubMenus">
              <Icon type="detail-D" />
              <ItemsSubMenuWapper className="subMenus">
                <li>
                  <a href={explorer}>DevTools</a>
                </li>
                <li>
                  <a href={forums}>Telegram</a>
                </li>
                <li>{currentServer === 'mainnet' ? <a href={mainnet}>Mainnet</a> : <a href={testnet}>Testnet</a>}</li>
                <li>
                  <a href={faq}>Docs</a>
                </li>
              </ItemsSubMenuWapper>
            </li>
          </StyledUlTag>
          <StyledIconMobileMenu onClick={this._showMobileMenu}>
            <Icon type="menu" size="20" />
          </StyledIconMobileMenu>
        </MenuDisplay>
        {showMobileMenu && (
          <MenuMobile address={address} close={this._hideMobileMenu} closeWallet={this._showConfirmLogout} />
        )}
      </WrapperHeader>
    );
  }
}

Header.defaultProps = {
  dispatch() {},
  bgColor: '',
  needAuth: false,
};

const mapStateToProps = state => {
  const { account } = state;
  return {
    needAuth: account.needAuth,
    address: account.address,
    flags: account.flags,
    isIpValid: state.globalData.isIpValid,
  };
};

export default connect(
  mapStateToProps,
  null
)(withRouter(Header));
