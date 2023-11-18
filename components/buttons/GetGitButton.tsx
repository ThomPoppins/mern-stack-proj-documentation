// MongoDBTryFreeButton.js
import styled from 'styled-components'

const GetGitButton = styled.button`
  background-color: #a82c1f;
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
    background-color: #f14e32;
    border-radius: 40px;
  }
`

export default GetGitButton
