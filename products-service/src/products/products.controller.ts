import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import {
  createProductSwagger,
  deleteProductSwagger,
  listProductsSwagger,
} from './products.swagger';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation(createProductSwagger.operation)
  @ApiBody(createProductSwagger.body)
  @ApiCreatedResponse(createProductSwagger.createdResponse)
  @ApiBadRequestResponse(createProductSwagger.badRequest)
  create(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto);
  }

  @Delete(':id')
  @ApiOperation(deleteProductSwagger.operation)
  @ApiParam(deleteProductSwagger.param)
  @ApiOkResponse(deleteProductSwagger.okResponse)
  @ApiNotFoundResponse(deleteProductSwagger.notFound)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.deleteProduct(id);
  }

  @Get()
  @ApiOperation(listProductsSwagger.operation)
  @ApiQuery(listProductsSwagger.pageQuery)
  @ApiQuery(listProductsSwagger.limitQuery)
  @ApiOkResponse(listProductsSwagger.okResponse)
  getProducts(@Query('page') page = '1', @Query('limit') limit = '10') {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return this.productsService.getProducts(
      Number.isNaN(pageNumber) ? 1 : pageNumber,
      Number.isNaN(limitNumber) ? 10 : limitNumber,
    );
  }
}
