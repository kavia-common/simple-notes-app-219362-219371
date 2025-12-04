import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Ocean Notes header', () => {
  render(<App />);
  const header = screen.getByLabelText(/Ocean Notes/i);
  expect(header).toBeInTheDocument();
});
