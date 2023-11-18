// MongoDBTryFreeButton.js
import styled from 'styled-components'

const MongoDBTryFreeButton = styled.button`
  background-color: #5e7f4b;
  color: white;
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
  border: 4px solid black;
  box-sizing: border-box;
  border-radius: 5px;
  transition-property: border-radius;
  transition-duration: 0.15s;
  transition-timing-function: ease;
  transition-delay: 0s;

  &:hover {
    border-radius: 40px;
    background-color: #91c16f;
  }
`

export default MongoDBTryFreeButton
