import styled from '@emotion/styled';

export const selectStyleDefault = (width = '100px') => `{
  height: 54px;
  width: ${width};
  border: 1px solid #dcdde3;
  background: #fff;
  padding: 16px 5px;
  font-size: 15px;
}`;

export const PhoneInputCustom = styled('div')`
  .PhoneInput {
    display: flex;

    .PhoneInputCountry {
      display: flex;
      align-items: center;
      position: relative;

      select {
        ${selectStyleDefault('130px')}
      }

      .PhoneInputCountryIcon,
      .PhoneInputCountryIcon--border {
        position: absolute;
        right: 20px;
        display: flex;
        align-items: center;
        img {
          width: 30px;
          border-radius: 5px;
        }
      }
    }
  }
`;
