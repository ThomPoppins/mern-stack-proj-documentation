// MongoDBTryFreeButton.js
import React, { ButtonHTMLAttributes } from 'react'
import styled from 'styled-components'

interface DownloadButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  // Add any custom props here. For example:
  // customProp?: string;
}

const DownloadButton = styled.button`
  background-color: #003399;
  color: #ddd;
  border: none;
  padding: 10px 24px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 18px;
  font-weight: 600;
  margin: 4px 2px;
  margin-top: 20px;
  cursor: pointer;
  border: 4px solid #666;
  box-sizing: border-box;
  border-radius: 5px;
  transition-property: border-radius;
  transition-duration: 0.15s;
  transition-timing-function: ease;
  transition-delay: 0s;

  &:hover {
    border-radius: 40px;
    border-color: #fff;
    color: #fff;
    background-color: #2f81f7;
  }
`

export default DownloadButton
