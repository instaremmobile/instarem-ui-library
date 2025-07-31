import styled from "styled-components";
import { COLORS } from "../../lib";

export const InputFieldContainer = styled.div`
  width: 100%;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  font-family: "hellix-regular";
`;

export const InputField = styled.input`
  display: flex;
  justify-content: center;
  padding: 16px;
  caret-color: ${COLORS.brandPrimary};
  font-size: 16px;
  border: 1px solid ${COLORS.colorBorderGrey};
  outline: none;
  width: 100%;
  border-radius: 4px;
  transition: border 0.2s ease;
  font-family: "Hellix-regular";
  &:focus {
    border-color: ${COLORS.colorBlack};
  }

  &:focus + label,
  &:not(:placeholder-shown) + label {
    top: 0;
    left: 16px;
    font-size: 14px;
    color: ${COLORS.colorBlack};
    padding: 0 8px;
    background-color: ${COLORS.colorWhite};
  }
`;

type LabelType = {
  placeholder?: string;
  label?: string;
};

export const Label = styled.label<LabelType>`
  position: absolute;
  top: ${({ placeholder, label }) => (placeholder && label ? "0" : "1.6em")};
  left: ${({ placeholder, label }) =>
    placeholder && label ? "16px" : "1.6em"};
  font-size: ${({ placeholder, label }) =>
    placeholder && label ? "14px" : "16px"};
  color: ${({ placeholder, label }) =>
    placeholder && label ? COLORS.colorBlack : COLORS.colorBorderGrey};
  pointer-events: none;
  transition: all 0.2s ease;
  padding: ${({ placeholder, label }) =>
    placeholder && label ? "0 8px" : "inherit"};
  background-color: ${({ placeholder, label }) =>
    placeholder && label ? COLORS.colorWhite : "inherit"};
`;
