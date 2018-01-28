package mbb.swagger;

import io.swagger.codegen.*;
import io.swagger.models.properties.*;

import java.util.*;
import java.io.File;

public class TypeScriptNodeClientCodegen extends io.swagger.codegen.languages.TypeScriptNodeClientCodegen {
    @Override
    public Map<String, Object> postProcessOperations(Map<String, Object> objs) {
        Map<String, Object> result = super.postProcessOperations(objs);
        Map<String, Object> operations = (Map<String, Object>)result.get("operations");
        String className = (String)operations.get("classname");
        ArrayList<CodegenOperation> cgOperations = (ArrayList<CodegenOperation>)operations.get("operation");
        String cgOperationPrefix = this.snakeCase(className);
        for (CodegenOperation cgOperation: cgOperations) {
            if (cgOperation.nickname.startsWith(cgOperationPrefix)) {
                cgOperation.nickname = this.snakeCase(cgOperation.nickname.substring(cgOperationPrefix.length()));
            }
        }
        return result;
    }
}