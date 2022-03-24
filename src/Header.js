import React from "react";
import { connect } from "react-redux";
import { path } from "ramda";
import { Link, Route } from "react-router-dom";
import { bool, object, string } from "prop-types";
import styled from "styled-components";
import PriorityFilter from "./priorityFilter/PriorityFilter"

const Container = styled.div(({ theme }) => ({
  backgroundColor: theme.colors.lightGrey,
  display: "flex",
  flexDirection: "column",
  position: "sticky",
  top: 0,
  boxShadow: "0 0 8px 0 rgba(0,0,0,0.2)",
  zIndex: 5
}));

const Row = styled.div({
  display: "flex",
  flexDirection: "row",
  alignItems: "center"
});

const Img = styled.img({
  maxHeight: 55,
  marginTop: 20,
  marginBottom: 20,
  marginLeft: 35,
  marginRight: "2%"
});

const StyledLink = styled(Link)`
    font-family: ${({ theme }) => theme.fonts.fontFamily};
    font-size: ${({ theme }) => `${theme.textDimensions.regular}px`};
    text-transform: uppercase;
    margin-left: 20px;
    margin-right: 20px;
    border-bottom-color: ${({ theme }) => theme.colors.red};
    border-bottom-width: 3px;
    border-bottom-style: ${({ isactive }) => (isactive ? "solid" : "none")};
    text-decoration: none;
    color: ${({ theme }) => theme.colors.black};

    &:hover {
        border-bottom-style: solid;
    }
`;

const HeaderLink = ({ label, to }) => (
  <Route
    path={to}
    exact
    children={({ match }) => (
      <StyledLink isactive={match ? match : undefined} to={to}>
        {label}
      </StyledLink>
    )}
  />
);

HeaderLink.propTypes = {
  label: string,
  match: object,
  to: string
};

const Header = ({ authenticated, board, hasReportingAccess }) => {

  if (!authenticated) return null;
  else
    return (
      <Container>
        <Row>
          <Img alt="movify" src={require("./assets/movify.png")} />
          <nav>
            <HeaderLink label="Business" to="/kanban" />
            <HeaderLink label="Recruitment" to="/recruitment" />
            <HeaderLink label="Hot candidates" to="/hot-candidates" />
            {
              hasReportingAccess && <HeaderLink label="Reporting" to="/reporting" />
            }

          </nav>
          <PriorityFilter board={board} />
        </Row>
      </Container >
    );
};

Header.propTypes = {
  authenticated: bool,
  board: string,
  hasReportingAccess: bool
};

export default connect(state => ({
  authenticated: path(["auth", "authenticated"], state),
  hasReportingAccess: path(["user", "accessToReportingTab", "hasAccessToReporting"], state)
}))(Header);
