rem #1: swagger-codegen folder
rem #2: input swagger JSON spec (./swagger/output/swagger.json)
rem #3: output generated API client (../mbb.client.user/src/swagger)
java -cp %1/swagger-codegen-cli.jar;%1/TypeScriptNodeClientCodegen-swagger-codegen-1.0.0.jar io.swagger.codegen.SwaggerCodegen generate -l mbb.swagger.TypeScriptNodeClientCodegen -t %1/swagger-codegen-templates/typescript-node -i %2 -o %3