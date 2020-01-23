import { parseMaxSize } from 'src/parse-max-size';

describe('parseMaxSize', () => {
  describe('given maxSize without decimal', () => {
    it('correctly parses value without space', () => {
      const maxSize = '25K';
      const { exactUnit, unitForIndex, unParsedSize, hasSpace } = parseMaxSize(
        maxSize
      );

      expect(exactUnit).toEqual('K');
      expect(unitForIndex).toEqual('K');
      expect(unParsedSize).toEqual('25');
      expect(hasSpace).toBe(false);
    });

    it('correctly parses value with space', () => {
      const maxSize = '8 b';
      const { exactUnit, unitForIndex, unParsedSize, hasSpace } = parseMaxSize(
        maxSize
      );

      expect(exactUnit).toEqual('b');
      expect(unitForIndex).toEqual('B');
      expect(unParsedSize).toEqual('8');
      expect(hasSpace).toBe(true);
    });

    it('correctly parses value with lowercase unit without space', () => {
      const maxSize = '1m';
      const { exactUnit, unitForIndex, unParsedSize, hasSpace } = parseMaxSize(
        maxSize
      );

      expect(exactUnit).toEqual('m');
      expect(unitForIndex).toEqual('M');
      expect(unParsedSize).toEqual('1');
      expect(hasSpace).toBe(false);
    });
  });

  describe('given maxSize with decimal', () => {
    it('correctly parses value without space', () => {
      const maxSize = '25.79T';
      const { exactUnit, unitForIndex, unParsedSize, hasSpace } = parseMaxSize(
        maxSize
      );

      expect(exactUnit).toEqual('T');
      expect(unitForIndex).toEqual('T');
      expect(unParsedSize).toEqual('25.79');
      expect(hasSpace).toBe(false);
    });

    it('correctly parses value with space', () => {
      const maxSize = '10087 gigabytes';
      const { exactUnit, unitForIndex, unParsedSize, hasSpace } = parseMaxSize(
        maxSize
      );

      expect(exactUnit).toEqual('gigabytes');
      expect(unitForIndex).toEqual('GIGABYTES');
      expect(unParsedSize).toEqual('10087');
      expect(hasSpace).toBe(true);
    });

    it('correctly parses value with lowercase unit without space', () => {
      const maxSize = '20k';
      const { exactUnit, unitForIndex, unParsedSize, hasSpace } = parseMaxSize(
        maxSize
      );

      expect(exactUnit).toEqual('k');
      expect(unitForIndex).toEqual('K');
      expect(unParsedSize).toEqual('20');
      expect(hasSpace).toBe(false);
    });
  });

  describe('given invalid maxSize format', () => {
    it('should return null for all fields when format is completely wrong', () => {
      const maxSize = 'sladfj';
      const { exactUnit, unitForIndex, unParsedSize, hasSpace } = parseMaxSize(
        maxSize
      );

      expect(exactUnit).toBeNull();
      expect(unitForIndex).toBeNull();
      expect(unParsedSize).toBeNull();
      expect(hasSpace).toBe(false);
    });

    it('should return valid data for all valid fields and null for everything else', () => {
      const maxSize = '20 blah';
      const { exactUnit, unitForIndex, unParsedSize, hasSpace } = parseMaxSize(
        maxSize
      );

      expect(exactUnit).toEqual('blah');
      expect(unitForIndex).toEqual('BLAH');
      expect(unParsedSize).toEqual('20');
      expect(hasSpace).toBe(true);
    });
  });
});
