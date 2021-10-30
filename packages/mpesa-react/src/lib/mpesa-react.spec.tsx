import { render } from '@testing-library/react';

import MpesaReact from './mpesa-react';

describe('MpesaReact', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MpesaReact />);
    expect(baseElement).toBeTruthy();
  });
});
