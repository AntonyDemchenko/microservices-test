import { ApiProperty } from '@nestjs/swagger';

export class ProductDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Premium subscription' })
  name: string;

  @ApiProperty({ example: '99.90' })
  price: string;

  @ApiProperty({ example: '2024-01-01T12:00:00.000Z' })
  created_at: string;
}

export class ProductListMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 42 })
  total: number;
}

export class ProductListResponseDto {
  @ApiProperty({ type: ProductDto, isArray: true })
  data: ProductDto[];

  @ApiProperty({ type: ProductListMetaDto })
  meta: ProductListMetaDto;
}
