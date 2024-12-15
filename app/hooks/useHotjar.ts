"use client";

import { useEffect } from 'react';
import Hotjar from '@hotjar/browser';

const HOTJAR_SITE_ID = 5242023;
const HOTJAR_VERSION = 6;

export const useHotjar = () => {
  useEffect(() => {
    Hotjar.init(HOTJAR_SITE_ID, HOTJAR_VERSION, {
      debug: process.env.NODE_ENV === 'development'
    });
  }, []);
}; 