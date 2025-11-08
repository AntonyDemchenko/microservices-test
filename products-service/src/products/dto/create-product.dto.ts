import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    example: 'Premium subscription',
    description: 'Product display name',
  })
  name: string;

  @ApiProperty({ example: 99.9, description: 'Price in USD' })
  price: number;
}
