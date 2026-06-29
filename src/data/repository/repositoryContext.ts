import { createContext } from 'react';
import type { LibraryRepository } from './LibraryRepository';

export const RepositoryContext = createContext<LibraryRepository | null>(null);
