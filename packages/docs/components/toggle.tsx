"use client";
import * as Switch from "@radix-ui/react-switch";
import { css, styled } from "next-yak";
import { FC } from "react";

interface ToggleProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
}

export const Toggle: FC<ToggleProps> = ({
  checked,
  defaultChecked = false,
  onCheckedChange = () => {},
  label = "minify classes",
  disabled = false,
  id,
}) => {
  const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <ToggleContainer>
      <Label htmlFor={switchId} data-disabled={disabled ? "" : undefined}>
        {label}
      </Label>
      <StyledRoot
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        id={switchId}
      >
        <StyledThumb>
          <IconContainer>
            <CrossIcon
              viewBox="0 0 365.696 365.696"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="currentColor"
                d="M243.188 182.86 356.32 69.726c12.5-12.5 12.5-32.766 0-45.247L341.238 9.398c-12.504-12.503-32.77-12.503-45.25 0L182.86 122.528 69.727 9.374c-12.5-12.5-32.766-12.5-45.247 0L9.375 24.457c-12.5 12.504-12.5 32.77 0 45.25l113.152 113.152L9.398 295.99c-12.503 12.503-12.503 32.769 0 45.25L24.48 356.32c12.5 12.5 32.766 12.5 45.247 0l113.132-113.132L295.99 356.32c12.503 12.5 32.769 12.5 45.25 0l15.081-15.082c12.5-12.504 12.5-32.77 0-45.25zm0 0"
              />
            </CrossIcon>
            <CheckmarkIcon
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="currentColor"
                d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121z"
              />
            </CheckmarkIcon>
          </IconContainer>
        </StyledThumb>
      </StyledRoot>
    </ToggleContainer>
  );
};

const ToggleContainer = styled.div`
  display: inline-flex;
  align-items: center;
`;

const Label = styled.label`
  font-size: 14px;
  padding-inline-end: 12px;
  color: var(--color-fd-muted-foreground);
  cursor: pointer;
  margin: 0;

  &[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const variables = css`
  --switch-width: 46px;
  --switch-height: 24px;
  --switch-bg: hsl(0, 0%, 32%);
  --switch-checked-bg: hsl(93.7, 23.7%, 33.9%);
  --switch-offset: calc((var(--switch-height) - var(--circle-diameter)) / 2);
  --switch-transition: all 0.2s cubic-bezier(0.27, 0.2, 0.25, 1.51);

  :global(html.light) & {
    --switch-bg: hsl(0, 0%, 75%);
    --switch-checked-bg: hsl(95.5, 30.4%, 68.4%);
  }

  /* Circle */
  --circle-diameter: 18px;
  --circle-bg: #fff;
  --circle-shadow: 1px 1px 2px rgba(146, 146, 146, 0.45);
  --circle-checked-shadow: -1px 1px 2px rgba(163, 163, 163, 0.45);
  --circle-transition: var(--switch-transition);

  /* Icon */
  --icon-transition: all 0.2s cubic-bezier(0.27, 0.2, 0.25, 1.51);
  --icon-cross-color: var(--switch-bg);
  --icon-cross-size: 6px;
  --icon-checkmark-color: var(--switch-checked-bg);
  --icon-checkmark-size: 10px;

  :global(html.light) & {
    --icon-cross-color: hsl(0, 0%, 45%);
    --icon-checkmark-color: hsl(0, 0%, 45%);
  }

  /* Effect line */
  --effect-width: calc(var(--circle-diameter) / 2);
  --effect-height: calc(var(--effect-width) / 2 - 1px);
  --effect-bg: var(--circle-bg);
  --effect-border-radius: 1px;
  --effect-transition: all 0.2s ease-in-out;
`;

const StyledRoot = styled(Switch.Root)`
  ${variables};

  /* Switch styling */
  width: var(--switch-width);
  height: var(--switch-height);
  background: var(--switch-bg);
  border-radius: 999px;
  position: relative;
  transition: var(--switch-transition);
  cursor: pointer;
  border: none;
  outline: none;
  display: flex;
  align-items: center;

  &[data-state="checked"] {
    background: var(--switch-checked-bg);
  }

  /* Effect line */
  &::before {
    content: "";
    position: absolute;
    width: var(--effect-width);
    height: var(--effect-height);
    left: calc(var(--switch-offset) + (var(--effect-width) / 2));
    background: var(--effect-bg);
    border-radius: var(--effect-border-radius);
    transition: var(--effect-transition);
  }

  &[data-state="checked"]::before {
    left: calc(
      100% - var(--effect-width) -
        (var(--effect-width) / 2) - var(--switch-offset)
    );
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px rgba(0, 218, 80, 0.3);
  }
`;

const StyledThumb = styled(Switch.Thumb)`
  width: var(--circle-diameter);
  height: var(--circle-diameter);
  background: var(--circle-bg);
  border-radius: inherit;
  box-shadow: var(--circle-shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--circle-transition);
  z-index: 1;
  position: absolute;
  left: var(--switch-offset);
  transform: translateX(0);

  &[data-state="checked"] {
    transform: translateX(
      calc(
        var(--switch-width) - var(--circle-diameter) -
          (2 * var(--switch-offset))
      )
    );
    box-shadow: var(--circle-checked-shadow);
  }
`;

const IconContainer = styled.div`
  position: relative;
  width: var(--icon-checkmark-size);
  height: var(--icon-checkmark-size);
`;

const CrossIcon = styled.svg`
  position: absolute;
  width: var(--icon-cross-size);
  height: var(--icon-cross-size);
  color: var(--icon-cross-color);
  transition: var(--icon-transition);
  transform: scale(1);
  top: 50%;
  left: 50%;
  margin-top: calc(var(--icon-cross-size) / -2);
  margin-left: calc(var(--icon-cross-size) / -2);

  [data-state="checked"] & {
    transform: scale(0);
  }
`;

const CheckmarkIcon = styled.svg`
  position: absolute;
  width: var(--icon-checkmark-size);
  height: var(--icon-checkmark-size);
  color: var(--icon-checkmark-color);
  transition: var(--icon-transition);
  transform: scale(0);
  top: 50%;
  left: 50%;
  margin-top: calc(var(--icon-checkmark-size) / -2);
  margin-left: calc(var(--icon-checkmark-size) / -2);

  [data-state="checked"] & {
    transform: scale(1);
  }
`;
