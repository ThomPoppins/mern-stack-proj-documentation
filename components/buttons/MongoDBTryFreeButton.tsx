// MongoDBTryFreeButton.js
import styled from 'styled-components';

const MongoDBTryFreeButton = styled.button`
  background-color: #00ED64;
  color: white;
  border: none;
  padding: 15px 32px;
  text-align: center;
  font-weight: bold;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  margin-top: 20px;
  cursor: pointer;
  border-radius: 4px;
  &:hover {
    transition-property: border-radius;
    transition-duration: 0.15s;
    transition-timing-function: ease;
    transition-delay: 0s;
    border-radius: 40px;
    background-color: #0e8e44;
  }
`;

export default MongoDBTryFreeButton;