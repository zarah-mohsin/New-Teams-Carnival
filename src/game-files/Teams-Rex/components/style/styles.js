/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { makeStyles, shorthands } from "@fluentui/react-components";

export const getPlayerControlStyles = makeStyles({
  root: {
    backgroundColor: "black",
    position: "absolute",
    zIndex: 0,
    top: "0",
    right: "0",
    left: "0",
    bottom: "0",
    fontFamily: "Pixel",
    fontSize: "6px",
    textAlign: "center",
    color: "#454db8",
  },
});

export const getProgressBarStyles = makeStyles({
  root: {
    width: "100%",
    cursor: "pointer",
    minHeight: "0px",
    fontFamily: "Pixel",
    fontSize: "6px",
    textAlign: "center",
    color: "#454db8",
  },
});

export const getPillStyles = makeStyles({
  root: {
    // backgroundColor: tokens.colorNeutralBackground3,
    // color: tokens.colorNeutralForeground1,
    pointerEvents: "none",
    fontSize: "18px",
    lineHeight: "100%",
    paddingTop: "2rem",
    // paddingBottom: "0.6rem",
    paddingLeft: "0.8rem",
    paddingRight: "0.8rem",
    borderTopLeftRadius: "1.6rem",
    borderTopRightRadius: "1.6rem",
    borderBottomLeftRadius: "1.6rem",
    borderBottomRightRadius: "1.6rem",
    marginBottom: "0.8rem",
    maxWidth: "80%",
    fontFamily: "Pixel",
    textAlign: "center",
    color: "#454db8",
  },
});

export const getLiveNotificationStyles = makeStyles({
  root: {
    pointerEvents: "none",
    position: "absolute",
    zIndex: 200,
    top: "5px",
    left: "4px",
    right: "4px",
    textAlign: "center",
    fontFamily: "Pixel",
    fontSize: "6px", // Updated this line
    color: "#454db8",
  },
});

// Remaining JavaScript code for FlexColumn component is unchanged...
