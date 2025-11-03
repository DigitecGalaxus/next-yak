"use client";
import Link from "next/link";
import React from "react";
import styled from "styled-components";

const Centered = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
`;

const IntroText = styled.p`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  font-family: sans-serif;
`;

// Looks like a fancy ghost button with a cool hover border effect
const PerformanceTestStartLink = styled(Link)`
  display: inline-block;
  padding: 10px 20px;
  border: 2px solid #000;
  border-radius: 5px;
  text-decoration: none;
  color: #000;
  font-weight: bold;
  transition: 0.3s;
  margin-right: 10px;
  font-family: sans-serif;
`;

const Explanation = styled.div`
  font-family: sans-serif;
  text-align: left;
  margin-top: 20px;
  color: #333;
`;

const List = styled.ol`
  margin-left: 0px;
  padding-left: 20px;
  > li {
    margin-bottom: 5px;
  }
`;

export default function Home() {
  return (
    <Centered>
      <div>
        <IntroText>Render Performance Benchmark</IntroText>
        <PerformanceTestStartLink href="/styled">
          styled-components
        </PerformanceTestStartLink>
        <PerformanceTestStartLink href="/yak">yak</PerformanceTestStartLink>
        <Explanation>
          <p>
            This benchmark renders 2500 Kanji characters with different
            components. The code is the same except for the import statement.
          </p>
          <p>
            In addition there are buttons which allow triggering different
            rendering scenarios:
          </p>
          <List>
            <li>Change the css variable on the wrapper</li>
            <li>Change the color to 1 of 3 predefined values</li>
            <li>
              Change the color to 1 of 3 predefined values inside a @media query
            </li>
            <li>Change the rotation to a custom value</li>
            <li>Change the rotation to a custom value inside a @media query</li>
            <li>Change the class name on the wrapper</li>
          </List>
        </Explanation>
      </div>
    </Centered>
  );
}
