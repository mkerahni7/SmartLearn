import { useDispatch, useSelector } from 'react-redux';

/**
 * Redux Hooks
 * 
 * Typed hooks for Redux store access
 */

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

