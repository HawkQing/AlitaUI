import { useTheme } from '@emotion/react';
import SvgIcon from "@mui/material/SvgIcon";

export default function StarIcon(props) {
  const theme = useTheme();
  return (
    <SvgIcon {...props}>
      <svg
        width="17"
        height="16"
        viewBox="0 0 17 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14.787 6.39292C14.7308 6.21317 14.6249 6.05456 14.4824 5.93683C14.3399 5.81909 14.1672 5.74744 13.9857 5.7308L10.5397 5.42262L9.18897 2.09037C9.11864 1.91552 9.00001 1.76616 8.84803 1.66111C8.69605 1.55606 8.5175 1.5 8.33487 1.5C8.15224 1.5 7.97369 1.55606 7.8217 1.66111C7.66972 1.76616 7.5511 1.91552 7.48077 2.09037L6.13405 5.42262L2.684 5.73261C2.50183 5.74849 2.32824 5.81981 2.18498 5.93763C2.04173 6.05545 1.9352 6.21453 1.87874 6.39491C1.82229 6.57529 1.81843 6.76895 1.86765 6.95159C1.91687 7.13424 2.01698 7.29774 2.15541 7.42161L4.77283 9.79439L3.98836 13.3181C3.94688 13.5024 3.95872 13.6954 4.02239 13.8729C4.08606 14.0503 4.19875 14.2044 4.34636 14.3158C4.49397 14.4271 4.66995 14.4909 4.85231 14.4991C5.03466 14.5073 5.2153 14.4595 5.37163 14.3618L8.3308 12.4958L11.2964 14.3618C11.4527 14.4595 11.6333 14.5073 11.8157 14.4991C11.998 14.4909 12.174 14.4271 12.3216 14.3158C12.4692 14.2044 12.5819 14.0503 12.6456 13.8729C12.7093 13.6954 12.7211 13.5024 12.6796 13.3181L11.8957 9.79078L14.5126 7.42161C14.651 7.29732 14.7509 7.13335 14.7997 6.95031C14.8486 6.76728 14.8441 6.57335 14.787 6.39292ZM13.9039 6.69388L11.2871 9.06305C11.1597 9.17798 11.065 9.32676 11.013 9.49337C10.9611 9.65999 10.9539 9.83815 10.9923 10.0087L11.7785 13.5384L8.8153 11.6724C8.67072 11.5811 8.50472 11.5327 8.33545 11.5327C8.16618 11.5327 8.00017 11.5811 7.8556 11.6724L4.89642 13.5384L5.67741 10.0111C5.71579 9.84056 5.70863 9.6624 5.6567 9.49578C5.60476 9.32916 5.51002 9.18039 5.38266 9.06546L2.76466 6.69749C2.76444 6.69569 2.76444 6.69387 2.76466 6.69207L6.21354 6.38269C6.38193 6.36729 6.54306 6.30449 6.67957 6.20107C6.81608 6.09764 6.92278 5.95752 6.98815 5.79581L8.33487 2.46777L9.681 5.79581C9.74638 5.95752 9.85307 6.09764 9.98958 6.20107C10.1261 6.30449 10.2872 6.36729 10.4556 6.38269L13.9051 6.69207C13.9051 6.69207 13.9051 6.69569 13.9051 6.69629L13.9039 6.69388Z"
          fill={props.fill || theme.palette.icon.fill.default}
        />
      </svg>
    </SvgIcon>
  );
}
