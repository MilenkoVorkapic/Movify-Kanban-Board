import React from "react"
import styled, { css } from "styled-components"
import PropTypes from "prop-types"
import { Update } from "./svgs"
import theme from "../style/theme"

const Button = styled.button`
  ${({ color }) => css`
    background-color: ${color};
    border: none;
    padding: 0;
    margin: 0;
    border-radius: 0.75rem;
    font-size: 0;
    &:hover {
      cursor: pointer;
    }
  `}
    width: 24px !important;
    height: 24px !important;
`

const UpdateButton = ({ backgroundColor, color = theme.colors.white, onClick, title, className }) => {
  return (
    <Button color={backgroundColor} onClick={onClick} title={title} className={className}>
      <Update color={color} size="15px" />
    </Button>
  )
}

UpdateButton.propTypes = {
  backgroundColor: PropTypes.string,
  color: PropTypes.string,
  title: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
}

export default UpdateButton
