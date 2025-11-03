"use client";

import React, { useState, useEffect } from "react";

export function LogInp() {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    try {
      localStorage.setItem("log-inp", String(!isChecked));
    } catch (e) {}
  };

  // restore from localStorage
  useEffect(() => {
    try {
      const value = localStorage.getItem("log-inp");
      if (value === "true") {
        setIsChecked(true);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!isChecked) return;
    const elementTimings = new Map<HTMLElement, Record<string, number>>();
    let handlers = 0;
    // log PerformanceEventTiming for every input event
    const observer = new PerformanceObserver((list) => {
      handlers++;
      requestIdleCallback(() => {
        setTimeout(() => {
          list
            .getEntries()
            .forEach((entry: PerformanceEntry & { target?: HTMLElement }) => {
              if (!("target" in entry) || !entry.target) return;
              if (entry.name !== "click") return;

              const entriesPerElement = elementTimings.get(entry.target);
              const timings = entriesPerElement || {};
              if (!entriesPerElement) {
                elementTimings.set(entry.target, timings);
              }
              timings[entry.name] = entry.duration;
            });
          handlers--;
          if (handlers === 0) {
            elementTimings.forEach((timings, element) => {
              console.log(element.tagName, element.title);
              const longestName = Object.keys(timings).reduce((a, b) =>
                a.length > b.length ? a : b,
              );
              Object.entries(timings).forEach(([name, duration]) => {
                console.log(
                  `  ${name}: ${" ".repeat(
                    longestName.length - name.length,
                  )} ${Number(duration).toFixed(0)}ms`,
                );
              });
            });
            elementTimings.clear();
          }
        });
      });
    });

    // Register the observer for events
    observer.observe({
      type: "event",
      buffered: true,
      // @ts-ignore
      durationThreshold: 8,
    });
    return () => observer.disconnect();
  }, [isChecked]);

  return (
    <>
      <label
        style={{
          display: "block",
          position: "fixed",
          bottom: "10px",
          right: "10px",
          whiteSpace: "nowrap",
          fontFamily: "sans-serif",
        }}
      >
        <input
          style={{ marginRight: "5px" }}
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckboxChange}
        />
        log inp to console
      </label>
    </>
  );
}
