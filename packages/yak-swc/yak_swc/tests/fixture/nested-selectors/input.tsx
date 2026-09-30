import { styled } from "@yak/react";

export const Card = styled.div`
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h2 {
    color: #333;
    font-size: 24px;
    margin-bottom: 10px;
  }

  p {
    color: #666;
    font-size: 16px;
    line-height: 1.5;
  }

  .card-footer {
    margin-top: 20px;
    text-align: right;

    button {
      padding: 8px 16px;
      background-color: #28a745;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  }
`;
