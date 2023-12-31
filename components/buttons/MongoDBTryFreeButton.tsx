// MongoDBTryFreeButton.js
import styled from 'styled-components'

const MongoDBTryFreeButton = styled.button`
  background-color: #239c58;
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
    background-color: #2ecc71;
  }
`

export default MongoDBTryFreeButton
