import { formatarTamanho, isImagem } from '@/services/upload.service';

describe('upload.service helpers', () => {
    describe('formatarTamanho', () => {
        it('formats bytes', () => expect(formatarTamanho(512)).toBe('512 B'));
        it('formats KB', () => expect(formatarTamanho(1536)).toBe('1.5 KB'));
        it('formats MB', () => expect(formatarTamanho(2 * 1024 * 1024)).toBe('2.0 MB'));
    });

    describe('isImagem', () => {
        it('returns true for image types', () => {
            expect(isImagem('image/jpeg')).toBe(true);
            expect(isImagem('image/png')).toBe(true);
            expect(isImagem('image/webp')).toBe(true);
        });
        it('returns false for non-image types', () => {
            expect(isImagem('application/pdf')).toBe(false);
            expect(isImagem('text/csv')).toBe(false);
        });
    });
});
