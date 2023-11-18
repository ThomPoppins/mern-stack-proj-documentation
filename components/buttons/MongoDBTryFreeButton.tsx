// MongoDBTryFreeButton.js
import styled from 'styled-components';

const MongoDBTryFreeButton = styled.button`
  background-color: #00ED64;
  color: #001E2B;
  border: none;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 18px;
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
  }
`;

export default MongoDBTryFreeButton