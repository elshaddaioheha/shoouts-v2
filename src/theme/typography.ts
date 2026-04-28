import { fontFamily } from './fonts';

export const typography = {
  sectionHeading: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
  },

  pageHeading: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600' as const,
  },

  title: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
  },

  caption: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.4,
  },

  input: {
    fontFamily: fontFamily.workSansRegular,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },

  navItem: {
    fontFamily: fontFamily.interMedium,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
  },

  button: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
  },

  body: {
    fontFamily: fontFamily.workSansRegular,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },

  bodySmall: {
    fontFamily: fontFamily.workSansRegular,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400' as const,
  },

  eyebrow: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.4,
  },
} as const;
